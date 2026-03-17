import type { MovementType } from "../../domain/inventory-movement.entity";

export type CreateMovementInput = {
  variantId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  movementType: MovementType;
  referenceType?: string | null;
  referenceId?: string | null;
};
