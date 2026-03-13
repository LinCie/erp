import type { ProductImage } from "./product-image.entity";

type ProductEntity = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { ProductEntity };
