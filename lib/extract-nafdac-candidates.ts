import { normalizeNafdacNumber } from "@/lib/normalize-nafdac-number";

const CANDIDATE_PATTERNS = [
  /\b\d{2}-\d{4,6}[A-Z]?\b/g,
  /\b[A-Z]\d-\d{3,6}[A-Z]?\b/g,
  /\b[A-Z]{1,2}\d{1,3}-\d{3,8}[A-Z]?\b/g,
  /\b\d{2}\s?[/-]\s?\d{4,6}[A-Z]?\b/g,
];

function isLikelyNafdacCandidate(value: string) {
  const digitCount = (value.match(/\d/g) ?? []).length;
  const letterCount = (value.match(/[A-Z]/g) ?? []).length;
  const [left = "", right = ""] = value.split("-");

  if (!value.includes("-")) {
    return false;
  }

  if (digitCount < 4) {
    return false;
  }

  if (!/\d/.test(left) || !/\d{3,}/.test(right)) {
    return false;
  }

  if (letterCount > 3) {
    return false;
  }

  return true;
}

function scoreCandidate(value: string) {
  const digitCount = (value.match(/\d/g) ?? []).length;
  const letterCount = (value.match(/[A-Z]/g) ?? []).length;
  let score = 0;

  if (/^\d{2}-\d{4,6}[A-Z]?$/.test(value)) {
    score += 12;
  }

  if (/^[A-Z]\d-\d{3,6}[A-Z]?$/.test(value)) {
    score += 10;
  }

  score += digitCount * 2;
  score -= letterCount;

  return score;
}

export function extractNafdacCandidates(text: string) {
  const matches = new Map<string, number>();

  for (const pattern of CANDIDATE_PATTERNS) {
    const found = text.toUpperCase().match(pattern) ?? [];

    for (const match of found) {
      const normalized = normalizeNafdacNumber(match);

      if (normalized.length >= 6 && isLikelyNafdacCandidate(normalized)) {
        matches.set(normalized, Math.max(matches.get(normalized) ?? 0, scoreCandidate(normalized)));
      }
    }
  }

  return Array.from(matches.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([value]) => value);
}
