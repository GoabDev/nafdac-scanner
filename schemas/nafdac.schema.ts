import { z } from "zod";

export const VerifyNafdacRequestSchema = z.object({
  number: z.string().trim().min(3),
});

const GreenbookIngredientSchema = z
  .object({
    ingredient_name: z.string().nullable().optional(),
    synonym: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const GreenbookNamedEntitySchema = z
  .object({
    name: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const GreenbookProductSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  NAFDAC: z.string(),
  approval_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  strength: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  composition: z.string().nullable().optional(),
  product_description: z.string().nullable().optional(),
  pack_size: z.string().nullable().optional(),
  ingredient: GreenbookIngredientSchema,
  form: GreenbookNamedEntitySchema,
  applicant: GreenbookNamedEntitySchema,
  route: GreenbookNamedEntitySchema,
  product_category: GreenbookNamedEntitySchema,
});

export const GreenbookResponseSchema = z.object({
  draw: z.number(),
  recordsTotal: z.number(),
  recordsFiltered: z.number(),
  data: z.array(GreenbookProductSchema),
});

export const ProductResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  nafdacNumber: z.string(),
  category: z.string().nullable(),
  ingredientName: z.string().nullable(),
  form: z.string().nullable(),
  route: z.string().nullable(),
  strength: z.string().nullable(),
  applicant: z.string().nullable(),
  approvalDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  packSize: z.string().nullable(),
  composition: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
});

export const VerifyNafdacResponseSchema = z.object({
  source: z.literal("greenbook"),
  normalizedNumber: z.string(),
  status: z.enum(["verified", "not_found", "invalid_input", "unavailable"]),
  product: ProductResultSchema.nullable(),
  message: z.string().nullable().optional(),
});

export type ProductResult = z.infer<typeof ProductResultSchema>;
export type VerifyNafdacResponse = z.infer<typeof VerifyNafdacResponseSchema>;
