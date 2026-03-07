type ProductEntity = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { ProductEntity };
