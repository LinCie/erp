import type { InventoryEntity } from "../domain/inventory.entity";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

/**
 * Interface for inventory data access.
 * Methods accept an optional transaction context (tx) for atomic operations.
 */
export interface InventoryRepository {
  findMany(params: PaginationParams & { variantId?: string; locationId?: string }): Promise<PaginatedResult<InventoryEntity>>;
  findByVariantAndLocation(variantId: string, locationId: string, tx?: unknown): Promise<InventoryEntity | null>;
  upsert(
    variantId: string,
    locationId: string,
    quantityAvailable: number,
    quantityReserved: number,
    tx?: unknown
  ): Promise<InventoryEntity>;
  lockRow(variantId: string, locationId: string, tx?: unknown): Promise<InventoryEntity | null>;
}
