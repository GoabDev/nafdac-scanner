import { extractNafdacCandidates } from "@/lib/extract-nafdac-candidates";
import { OcrResultSchema } from "@/schemas/ocr.schema";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterResponse = {
  choices?: Array<{
    error?: {
      message?: string;
    };
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type OpenRouterMessageContent =
  | string
  | Array<{
      type?: string;
      text?: string;
    }>
  | undefined;

function getTextContent(content: OpenRouterMessageContent) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part.type === "text" ? part.text ?? "" : ""))
      .join("\n");
  }

  return "";
}

function parseCandidateResponse(rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as {
      nafdacNumber?: string | null;
      alternateCandidates?: string[] | null;
      extractedText?: string | null;
    };

    const candidates = [
      parsed.nafdacNumber ?? "",
      ...(parsed.alternateCandidates ?? []),
      ...extractNafdacCandidates(parsed.extractedText ?? ""),
    ]
      .map((value) => value.trim())
      .filter(Boolean);

    return OcrResultSchema.parse({
      text: parsed.extractedText ?? rawText,
      candidates: Array.from(new Set(candidates)).map((value) => ({ value })),
    });
  } catch {
    return OcrResultSchema.parse({
      text: rawText,
      candidates: extractNafdacCandidates(rawText).map((value) => ({ value })),
    });
  }
}

export async function extractNafdacNumberWithOpenRouter(
  imageBuffer: Buffer,
  mimeType: string,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_VISION_MODEL || "openrouter/free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const imageDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-OpenRouter-Title": "NAFDAC Scanner",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Extract the NAFDAC registration number from this image. Return JSON only with keys nafdacNumber, alternateCandidates, extractedText. If uncertain, set nafdacNumber to null. Keep alternateCandidates to 0-3 likely options. A NAFDAC number usually looks like 03-6514, 04-0076, or A8-1161.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    const errorMessage =
      payload.error?.message ??
      payload.choices?.[0]?.error?.message ??
      `OpenRouter request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  if (payload.choices?.[0]?.error?.message) {
    throw new Error(payload.choices[0].error.message);
  }

  const content = payload.choices?.[0]?.message?.content;
  const rawText = getTextContent(content);

  if (!rawText.trim()) {
    throw new Error("OpenRouter returned an empty response for the image.");
  }

  return parseCandidateResponse(rawText);
}
