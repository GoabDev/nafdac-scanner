import { z } from "zod";

export const OcrCandidateSchema = z.object({
  value: z.string(),
});

export const OcrResultSchema = z.object({
  text: z.string(),
  candidates: z.array(OcrCandidateSchema),
});

export type OcrResult = z.infer<typeof OcrResultSchema>;

export const ExtractNafdacResponseSchema = z.object({
  text: z.string(),
  candidates: z.array(OcrCandidateSchema),
  provider: z.enum(["openrouter", "tesseract"]),
  message: z.string().nullable().optional(),
});

export type ExtractNafdacResponse = z.infer<typeof ExtractNafdacResponseSchema>;
