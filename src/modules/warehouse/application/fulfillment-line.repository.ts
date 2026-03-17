import type { FulfillmentOrderLineEntity } from "../domain/fulfillment-order-line.entity";

/**
 * Interface for order line data access.
 * Methods accept an optional transaction context (tx) for atomic operations.
 */
export interface FulfillmentOrderLineRepository {
  create(line: Omit<FulfillmentOrderLineEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">, tx?: unknown): Promise<FulfillmentOrderLineEntity>;
  findByOrderId(orderId: string, tx?: unknown): Promise<FulfillmentOrderLineEntity[]>;
  updateReserved(id: string, quantityReserved: number, tx?: unknown): Promise<FulfillmentOrderLineEntity>;
  updateShipped(id: string, quantityShipped: number, tx?: unknown): Promise<FulfillmentOrderLineEntity>;
}
