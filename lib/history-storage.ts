import { HISTORY_STORAGE_KEY, MAX_HISTORY_ITEMS } from "@/lib/constants";
import {
  LookupHistoryItem,
  LookupHistorySchema,
  LookupHistoryStateSchema,
} from "@/schemas/history.schema";

export function getLookupHistory() {
  if (typeof window === "undefined") {
    return [] as LookupHistoryItem[];
  }

  const rawValue = window.localStorage.getItem(HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [] as LookupHistoryItem[];
  }

  const parsed = LookupHistoryStateSchema.safeParse(JSON.parse(rawValue));
  return parsed.success ? parsed.data : [];
}

export function saveLookupHistoryItem(item: LookupHistoryItem) {
  if (typeof window === "undefined") {
    return;
  }

  const validatedItem = LookupHistorySchema.parse(item);
  const nextItems = [validatedItem, ...getLookupHistory().filter((entry) => entry.id !== item.id)]
    .slice(0, MAX_HISTORY_ITEMS);

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextItems));
}
