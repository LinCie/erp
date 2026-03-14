import type { VariantEntity, VariantStatus } from "../../domain/variant.entity";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

export interface CreateVariantInput {
  productId: string;
  name: string;
  sku: string;
  status: VariantStatus;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
  images?: ProductImage[];
  createdBy?: string;
}

export interface UpdateVariantInput {
  name?: string;
  sku?: string;
  status?: VariantStatus;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
  images?: ProductImage[];
  updatedBy?: string;
}

export interface VariantFilters {
  productId: string;
  status?: VariantStatus;
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
