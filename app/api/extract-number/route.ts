import { NextResponse } from "next/server";
import { ExtractNafdacResponseSchema } from "@/schemas/ocr.schema";
import { extractNafdacNumberWithOpenRouter } from "@/services/server/vision/openrouter-vision.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          text: "",
          candidates: [],
          provider: "openrouter",
          message: "Upload an image before scanning.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await extractNafdacNumberWithOpenRouter(
      buffer,
      image.type || "image/jpeg",
    );

    return NextResponse.json(
      ExtractNafdacResponseSchema.parse({
        ...result,
        provider: "openrouter",
        message:
          result.candidates.length > 0
            ? "Number extracted with OpenRouter vision."
            : "OpenRouter vision read the image but did not find a strong NAFDAC candidate.",
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image extraction failed.";

    return NextResponse.json(
      {
        text: "",
        candidates: [],
        provider: "openrouter",
        message,
      },
      { status: 500 },
    );
  }
}
