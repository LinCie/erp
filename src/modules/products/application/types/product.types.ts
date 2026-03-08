import type { ProductEntity } from "../../domain/product.entity";
import type { PaginationMetadata } from "@/shared/application/types/pagination.type";

export type CreateProductInput = {
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
};

export type CreateProductOutput = ProductEntity;

export type FindProductByIdInput = {
  id: string;
};

export type FindProductByIdOutput = ProductEntity | undefined;

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
