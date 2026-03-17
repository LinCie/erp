import type { InventoryRepository } from "./inventory.repository";
import type { InventoryEntity } from "../domain/inventory.entity";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async listInventory(params: PaginationParams & { variantId?: string; locationId?: string }): Promise<PaginatedResult<InventoryEntity>> {
    return this.inventoryRepo.findMany(params);
  }

  async getInventory(variantId: string, locationId: string, tx?: unknown): Promise<InventoryEntity | null> {
    return this.inventoryRepo.findByVariantAndLocation(variantId, locationId, tx);
  }

  async increaseAvailable(variantId: string, locationId: string, quantity: number, tx?: unknown): Promise<InventoryEntity> {
    if (quantity <= 0) {
      throw new Error("INVALID_STATE: Quantity must be greater than zero");
    }
    
    const inventory = await this.inventoryRepo.lockRow(variantId, locationId, tx);
    
    const available = (inventory?.quantityAvailable ?? 0) + quantity;
    const reserved = inventory?.quantityReserved ?? 0;

    return this.inventoryRepo.upsert(variantId, locationId, available, reserved, tx);
  }

  async reserve(variantId: string, locationId: string, quantity: number, tx?: unknown): Promise<InventoryEntity> {
    if (quantity <= 0) {
      throw new Error("INVALID_STATE: Quantity must be greater than zero");
    }

    const inventory = await this.inventoryRepo.lockRow(variantId, locationId, tx);
    
    if (!inventory) {
      throw new Error("INSUFFICIENT_STOCK: Inventory not found");
    }

    if (inventory.quantityAvailable < quantity) {
      throw new Error("INSUFFICIENT_STOCK: Not enough available quantity");
    }

    const available = inventory.quantityAvailable - quantity;
    const reserved = inventory.quantityReserved + quantity;

    return this.inventoryRepo.upsert(variantId, locationId, available, reserved, tx);
  }

  async releaseReserved(variantId: string, locationId: string, quantity: number, tx?: unknown): Promise<InventoryEntity> {
    if (quantity <= 0) {
      throw new Error("INVALID_STATE: Quantity must be greater than zero");
    }

    const inventory = await this.inventoryRepo.lockRow(variantId, locationId, tx);
    
    if (!inventory) {
      throw new Error("INVALID_STATE: Inventory not found");
    }

    if (inventory.quantityReserved < quantity) {
      throw new Error("INVALID_STATE: Not enough reserved quantity to release");
    }

    const available = inventory.quantityAvailable + quantity;
    const reserved = inventory.quantityReserved - quantity;

    return this.inventoryRepo.upsert(variantId, locationId, available, reserved, tx);
  }

  async decreaseReserved(variantId: string, locationId: string, quantity: number, tx?: unknown): Promise<InventoryEntity> {
    if (quantity <= 0) {
      throw new Error("INVALID_STATE: Quantity must be greater than zero");
    }

    const inventory = await this.inventoryRepo.lockRow(variantId, locationId, tx);

    if (!inventory) {
      throw new Error("INVALID_STATE: Inventory not found");
    }

    if (inventory.quantityReserved < quantity) {
      throw new Error("INVALID_STATE: Not enough reserved quantity to decrease");
    }

    const available = inventory.quantityAvailable;
    const reserved = inventory.quantityReserved - quantity;

    return this.inventoryRepo.upsert(variantId, locationId, available, reserved, tx);
  }
}
