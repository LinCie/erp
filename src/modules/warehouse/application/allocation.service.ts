import type { FulfillmentOrderRepository } from "./fulfillment.repository";
import type { FulfillmentOrderLineRepository } from "./fulfillment-line.repository";
import type { InventoryRepository } from "./inventory.repository";
import type { MovementRepository } from "./movement.repository";

export class AllocationService {
  constructor(
    private readonly orderRepo: FulfillmentOrderRepository,
    private readonly orderLineRepo: FulfillmentOrderLineRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly movementRepo: MovementRepository
  ) {}

  /**
   * Reserves inventory for a given order at a specific location.
   * Assumes execution within a transaction context (`tx`).
   */
  async reserveOrder(orderId: string, locationId: string, tx: unknown): Promise<void> {
    const order = await this.orderRepo.findById(orderId, tx);
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (order.status !== "draft") {
      throw new Error(`INVALID_STATE: Cannot reserve order in status ${order.status}`);
    }

    const lines = await this.orderLineRepo.findByOrderId(orderId, tx);

    for (const line of lines) {
      const quantityToReserve = line.quantity - line.quantityReserved;
      
      if (quantityToReserve <= 0) continue;

      const inventory = await this.inventoryRepo.lockRow(line.variantId, locationId, tx);
      
      if (!inventory) {
        throw new Error(`INSUFFICIENT_STOCK: Inventory not found for variant ${line.variantId}`);
      }

      if (inventory.quantityAvailable < quantityToReserve) {
        throw new Error(`INSUFFICIENT_STOCK: Not enough available stock for variant ${line.variantId}`);
      }

      const available = inventory.quantityAvailable - quantityToReserve;
      const reserved = inventory.quantityReserved + quantityToReserve;

      await this.inventoryRepo.upsert(line.variantId, locationId, available, reserved, tx);

      await this.movementRepo.create(
        {
          variantId: line.variantId,
          fromLocationId: locationId,
          toLocationId: null,
          movementType: "reserve",
          quantity: quantityToReserve,
          referenceType: "order",
          referenceId: orderId,
        },
        tx
      );

      const newReserved = line.quantityReserved + quantityToReserve;
      await this.orderLineRepo.updateReserved(line.id, newReserved, tx);
    }

    await this.orderRepo.updateStatus(orderId, "reserved", tx);
  }
}
