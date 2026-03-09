import { z } from "zod";

export const variantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  sku: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/),
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).default("USD"),
  isDefault: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdBy: z.uuid().nullable().optional(),
  updatedBy: z.uuid().nullable().optional(),
});

export const createVariantSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "SKU can only contain letters, numbers, hyphens, and underscores",
    )
    .transform((val) => val.trim()),
  basePrice: z.number().min(0, "Base price must be non-negative"),
  salePrice: z.number().min(0, "Sale price must be non-negative").optional(),
  costPrice: z.number().min(0, "Cost price must be non-negative").optional(),
  currency: z.string().length(3).default("USD"),
  isDefault: z.boolean().default(false),
});

export const updateVariantSchema = createVariantSchema.partial();

export const bulkCreateSchema = z.object({
  variants: z.array(createVariantSchema).max(50, "Maximum 50 variants allowed"),
});

export const checkSkuQuerySchema = z.object({
  sku: z.string().min(1),
  excludeId: z.uuid().optional(),
});

export type Variant = z.infer<typeof variantSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type BulkCreateInput = z.infer<typeof bulkCreateSchema>;
export type CheckSkuQuery = z.infer<typeof checkSkuQuerySchema>;
