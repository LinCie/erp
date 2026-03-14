import type { ProductEntity, ProductStatus } from "../../domain/product.entity";
import type { ProductImage } from "../../domain/product-image.entity";
import type { CreateVariantInput } from "@/modules/variants/application/types/variant.types";
import type { PaginationMetadata } from "@/shared/application/types/pagination.type";

export const PRODUCT_STATUS_VALUES = ["draft", "active", "archived"] as const;
export type ProductStatusValue = (typeof PRODUCT_STATUS_VALUES)[number];

export const PRODUCT_SORT_FIELDS = [
  "name",
  "slug",
  "status",
  "createdAt",
  "updatedAt",
  "deletedAt",
] as const;

export const PRODUCT_SORT_ORDERS = ["asc", "desc"] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
export type ProductSortOrder = (typeof PRODUCT_SORT_ORDERS)[number];

export type CreateProductInput = {
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  status: ProductStatus;
  images?: ProductImage[];
  /** Optional variants to create alongside the product. If empty/absent, a default variant is auto-generated. */
  variants?: Array<Omit<CreateVariantInput, "productId">>;
};

export type CreateProductOutput = ProductEntity;

export type FindProductByIdInput = {
  id: string;
};

export type FindProductByIdOutput = ProductEntity | undefined;

export type FindProductByIdIncludingDeletedInput = {
  id: string;
};

export type FindProductByIdIncludingDeletedOutput = ProductEntity | undefined;

export type FindProductBySlugInput = {
  organizationId: string;
  slug: string;
};

export type FindProductBySlugOutput = ProductEntity | undefined;

export type FindAllProductsInput = {
  organizationId: string;
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus;
  sortBy: ProductSortField;
  sortOrder: ProductSortOrder;
};

export type FindAllProductsOutput = {
  data: ProductEntity[];
  metadata: PaginationMetadata;
};

export type UpdateProductInput = {
  id: string;
  organizationId: string;
  name?: string;
  description?: string | null;
  slug?: string;
  status?: ProductStatus;
  images?: ProductImage[];
};

export type UpdateProductOutput = ProductEntity;

export type DeleteProductInput = {
  id: string;
};

export type DeleteProductOutput = void;

export type CheckSlugUniquenessInput = {
  organizationId: string;
  slug: string;
  excludeId?: string;
};

export type CheckSlugUniquenessOutput = {
  isAvailable: boolean;
};

export type FindAllTrashedProductsInput = {
  organizationId: string;
  page: number;
  limit: number;
  search?: string;
  sortBy: ProductSortField;
  sortOrder: ProductSortOrder;
};

export type FindAllTrashedProductsOutput = {
  data: ProductEntity[];
  metadata: PaginationMetadata;
};

export type RestoreProductInput = {
  id: string;
  organizationId: string;
};

export type RestoreProductOutput = ProductEntity;

export type PermanentDeleteProductInput = {
  id: string;
  organizationId: string;
};

export type PermanentDeleteProductOutput = void;
