import type { ProductImage } from "./product-image.entity";

export type ProductStatus = "draft" | "active" | "archived";

type ProductEntity = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  status: ProductStatus;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { ProductEntity };
