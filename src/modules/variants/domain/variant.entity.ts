/**
 * Domain entity representing a sellable product variant.
 *
 * Each product has one or more variants. Every variant carries its own
 * SKU (globally unique among active variants), independent pricing,
 * and a currency code. Exactly one variant per product may be marked
 * as the default.
 *
 * Soft-delete semantics: when `deletedAt` is set, the variant is
 * considered removed and its SKU becomes eligible for reuse.
 */
export interface VariantEntity {
  id: string;
  productId: string;

  sku: string;

  basePrice: number;
  salePrice?: number | null;
  costPrice?: number | null;
  currency: string;

  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

/**
 * Generates a default variant value object for a product.
 *
 * Called when a product is created without explicit variant data.
 * The auto-generated SKU follows the pattern `AUTO-{first 8 chars of
 * productId}-{unix-ms timestamp}` to ensure practical uniqueness
 * without a database round-trip.
 *
 * @returns A partial VariantEntity (missing id, createdAt, updatedAt)
 *   suitable for passing to `VariantRepository.create()`.
 */
export function createDefaultVariant(
  productId: string,
): Omit<VariantEntity, "id" | "createdAt" | "updatedAt"> {
  return {
    productId,
    sku: `AUTO-${productId.slice(0, 8)}-${Date.now()}`,
    basePrice: 0,
    currency: "USD",
    isDefault: true,
  };
}
