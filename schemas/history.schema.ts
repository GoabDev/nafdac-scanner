import { z } from "zod";

export const LookupHistorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nafdacNumber: z.string(),
  category: z.string().nullable(),
  checkedAt: z.string(),
  status: z.enum(["verified", "not_found"]),
});

export const LookupHistoryStateSchema = z.array(LookupHistorySchema);

export type LookupHistoryItem = z.infer<typeof LookupHistorySchema>;
