import { z } from "zod";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

const ProductImageSchema = z.object({
  key: z.string(),
  alt: z.string(),
  order: z.number(),
});

const ProductImageArraySchema = z.array(ProductImageSchema);

export function parseProductImages(data: unknown): ProductImage[] {
  if (data === null || data === undefined) {
    return [];
  }

  const result = ProductImageArraySchema.safeParse(data);
  if (!result.success) {
    console.warn("Failed to parse product images:", result.error.message);
    return [];
  }

  return result.data;
}
