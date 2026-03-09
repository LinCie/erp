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
