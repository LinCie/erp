import { z } from "zod";

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

export const createProductSchema = z.object({
  name: productNameSchema,
  slug: productSlugSchema,
  description: productDescriptionSchema,
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
