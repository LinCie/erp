import type { OrderStatus, FulfillmentOrderEntity } from "../domain/fulfillment-order.entity";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

/**
 * Interface for order data access.
 * Methods accept an optional transaction context (tx) for atomic operations.
 */
export interface FulfillmentOrderRepository {
  findMany(params: PaginationParams & { status?: string }): Promise<PaginatedResult<FulfillmentOrderEntity>>;
  create(order: Omit<FulfillmentOrderEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">, tx?: unknown): Promise<FulfillmentOrderEntity>;
  findById(id: string, tx?: unknown): Promise<FulfillmentOrderEntity | null>;
  updateStatus(id: string, status: OrderStatus, tx?: unknown): Promise<FulfillmentOrderEntity>;
}
