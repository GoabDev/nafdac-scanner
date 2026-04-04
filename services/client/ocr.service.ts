import { extractNafdacCandidates } from "@/lib/extract-nafdac-candidates";
import { OcrResult, OcrResultSchema } from "@/schemas/ocr.schema";

type OcrProgressCallback = (progress: number, status: string) => void;
type OcrSource = {
  label: string;
  canvas: HTMLCanvasElement;
};
type PreprocessMode = "original" | "grayscale" | "threshold";

async function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load selected image."));
    };

    image.src = objectUrl;
  });
}

async function preprocessImage(file: File, mode: PreprocessMode) {
  const image = await loadImage(file);
  const targetWidth = image.width < 1200 ? 1600 : Math.min(image.width, 1800);
  const scale = targetWidth / image.width;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas preprocessing is not available.");
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  if (mode !== "original") {
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const grayscale = red * 0.299 + green * 0.587 + blue * 0.114;

      if (mode === "grayscale") {
        const adjusted = Math.max(0, Math.min(255, grayscale * 1.15));
        data[index] = adjusted;
        data[index + 1] = adjusted;
        data[index + 2] = adjusted;
      }

      if (mode === "threshold") {
        const thresholded = grayscale > 165 ? 255 : grayscale < 115 ? 0 : grayscale;
        data[index] = thresholded;
        data[index + 1] = thresholded;
        data[index + 2] = thresholded;
      }
    }

    context.putImageData(imageData, 0, 0);
  }

  return canvas;
}

function cropCanvas(
  source: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas cropping is not available.");
  }

  context.drawImage(source, x, y, width, height, 0, 0, width, height);
  return canvas;
}

function buildFallbackSources(source: HTMLCanvasElement) {
  const sources: OcrSource[] = [{ label: "full image", canvas: source }];
  const centerBandHeight = Math.max(120, Math.round(source.height * 0.34));
  const centerBandY = Math.max(0, Math.round((source.height - centerBandHeight) / 2));

  sources.push({
    label: "center band",
    canvas: cropCanvas(source, 0, centerBandY, source.width, centerBandHeight),
  });

  const sliceCount = 4;
  const sliceWidth = Math.max(1, Math.round(source.width / sliceCount));

  for (let index = 0; index < sliceCount; index += 1) {
    const sliceX = index * sliceWidth;
    const remainingWidth = source.width - sliceX;

    sources.push({
      label: `vertical slice ${index + 1}`,
      canvas: cropCanvas(source, sliceX, 0, Math.min(sliceWidth, remainingWidth), source.height),
    });
  }

  return sources;
}

export async function runNafdacOcr(
  file: File,
  onProgress?: OcrProgressCallback,
): Promise<OcrResult> {
  const originalImage = await preprocessImage(file, "original");
  const grayscaleImage = await preprocessImage(file, "grayscale");
  const thresholdImage = await preprocessImage(file, "threshold");
  const Tesseract = await import("tesseract.js");
  const worker = await Tesseract.createWorker("eng", 1, {
    logger: (message) => {
      if (typeof message.progress === "number") {
        onProgress?.(Math.min(0.6, message.progress * 0.6), message.status);
      }
    },
  });

  try {
    onProgress?.(0.05, "running primary OCR");
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ",
      preserve_interword_spaces: "1",
    });

    const primaryOriginalResult = await worker.recognize(originalImage, {
      rotateAuto: true,
    });
    const primaryGrayscaleResult = await worker.recognize(grayscaleImage, {
      rotateAuto: true,
    });

    const primaryText = [
      primaryOriginalResult.data.text,
      primaryGrayscaleResult.data.text,
    ].join("\n");
    const primaryCandidates = extractNafdacCandidates(primaryText);

    if (primaryCandidates.length > 0) {
      onProgress?.(1, "OCR finished");

      return OcrResultSchema.parse({
        text: primaryText,
        candidates: primaryCandidates.map((value) => ({ value })),
      });
    }

    const fallbackSources = [
      ...buildFallbackSources(originalImage),
      ...buildFallbackSources(grayscaleImage),
      ...buildFallbackSources(thresholdImage),
    ];
    const fallbackTexts: string[] = [primaryText];

    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
      preserve_interword_spaces: "1",
    });

    for (let index = 0; index < fallbackSources.length; index += 1) {
      const source = fallbackSources[index];

      onProgress?.(
        0.64 + ((index + 1) / fallbackSources.length) * 0.34,
        `retrying ${source.label}`,
      );

      const fallbackResult = await worker.recognize(source.canvas);
      fallbackTexts.push(fallbackResult.data.text);
    }

    const combinedText = fallbackTexts.join("\n");
    const fallbackCandidates = extractNafdacCandidates(combinedText);
    onProgress?.(1, "OCR finished");

    return OcrResultSchema.parse({
      text: combinedText,
      candidates: fallbackCandidates.map((value) => ({ value })),
    });
  } finally {
    await worker.terminate();
  }
}
