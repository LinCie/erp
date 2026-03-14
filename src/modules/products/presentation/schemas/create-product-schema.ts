import { z } from "zod";

export const PRODUCT_STATUS_OPTIONS = ["draft", "active", "archived"] as const;

export const productStatusSchema = z.enum(PRODUCT_STATUS_OPTIONS);

export const productNameSchema = z
  .string()
  .min(2, "Product name must be at least 2 characters")
  .max(255, "Product name must be less than 255 characters");

export const productSlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(255, "Slug must be less than 255 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );

export const productDescriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters");

export const productImageSchema = z.object({
  key: z.string(),
  alt: z.string(),
  order: z.number(),
});

export const productFormSchema = z.object({
  name: productNameSchema,
  slug: productSlugSchema,
  description: productDescriptionSchema,
  status: productStatusSchema,
  images: z.array(productImageSchema).max(10, "Maximum 10 images allowed").optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
