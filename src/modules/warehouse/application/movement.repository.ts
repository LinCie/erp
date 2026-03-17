import type { InventoryMovementEntity } from "../domain/inventory-movement.entity";
import type { CreateMovementInput } from "./types/movement.types";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

/**
 * Interface for movement data access.
 * Methods accept an optional transaction context (tx) for atomic operations.
 */
export interface MovementRepository {
  findMany(params: PaginationParams & { variantId?: string; referenceId?: string }): Promise<PaginatedResult<InventoryMovementEntity>>;
  create(input: CreateMovementInput, tx?: unknown): Promise<InventoryMovementEntity>;
  findByReference(referenceType: string, referenceId: string, tx?: unknown): Promise<InventoryMovementEntity[]>;
}
