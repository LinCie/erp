import type { VariantEntity } from "../../domain/variant.entity";

export interface CreateVariantInput {
  productId: string;
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
  createdBy?: string;
}

export interface UpdateVariantInput {
  sku?: string;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
  updatedBy?: string;
}

export interface VariantFilters {
  productId: string;
  includeDeleted?: boolean;
}

export interface VariantListOutput {
  data: VariantEntity[];
  meta: {
    total: number;
  };
}

export interface BulkCreateVariantsInput {
  productId: string;
  variants: Array<Omit<CreateVariantInput, "productId">>;
}

export interface SkuAvailabilityResult {
  available: boolean;
  existingVariantId?: string;
}
