const COMMON_OCR_REPLACEMENTS: Record<string, string> = {
  O: "0",
  I: "1",
};

export function normalizeNafdacNumber(value: string) {
  const trimmed = value.trim().toUpperCase();

  return trimmed
    .replace(/\s+/g, "-")
    .replace(/[OI]/g, (character) => COMMON_OCR_REPLACEMENTS[character] ?? character)
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}
