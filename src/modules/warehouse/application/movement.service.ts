import type { MovementRepository } from "./movement.repository";
import type { CreateMovementInput } from "./types/movement.types";
import type { InventoryMovementEntity } from "../domain/inventory-movement.entity";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

export class MovementService {
  constructor(private readonly movementRepo: MovementRepository) {}

  async listMovements(params: PaginationParams & { variantId?: string; referenceId?: string }): Promise<PaginatedResult<InventoryMovementEntity>> {
    return this.movementRepo.findMany(params);
  }

  async createMovement(input: CreateMovementInput, tx?: unknown): Promise<InventoryMovementEntity> {
    return this.movementRepo.create(input, tx);
  }
}
