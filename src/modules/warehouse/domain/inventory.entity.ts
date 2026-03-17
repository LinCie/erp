type InventoryEntity = {
  id: string;
  variantId: string;
  locationId: string;
  quantityAvailable: number;
  quantityReserved: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { InventoryEntity };
