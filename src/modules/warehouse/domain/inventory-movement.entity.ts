export type MovementType = "receive" | "move" | "reserve" | "ship" | "adjust";

type InventoryMovementEntity = {
  id: string;
  variantId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  movementType: MovementType;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { InventoryMovementEntity };
