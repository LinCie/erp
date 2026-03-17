import type { FulfillmentOrderRepository } from "./fulfillment.repository";
import type { FulfillmentOrderLineRepository } from "./fulfillment-line.repository";
import type { OrderDTO } from "./types/fulfillment.types";
import type { OrderStatus, FulfillmentOrderEntity } from "../domain/fulfillment-order.entity";
import type { FulfillmentOrderLineEntity } from "../domain/fulfillment-order-line.entity";
import type { PaginatedResult, PaginationParams } from "@/shared/application/types/pagination.type";

export type CreateOrderInput = {
  orderNumber: string;
  lines: Array<{
    variantId: string;
    quantity: number;
  }>;
};

export class FulfillmentService {
  constructor(
    private readonly orderRepo: FulfillmentOrderRepository,
    private readonly orderLineRepo: FulfillmentOrderLineRepository
  ) {}

  async listOrders(params: PaginationParams & { status?: string }): Promise<PaginatedResult<FulfillmentOrderEntity>> {
    return this.orderRepo.findMany(params);
  }

  async createOrder(input: CreateOrderInput, tx?: unknown): Promise<OrderDTO> {
    const order = await this.orderRepo.create(
      {
        orderNumber: input.orderNumber,
        status: "draft",
      },
      tx
    );

    const createdLines: FulfillmentOrderLineEntity[] = [];
    for (const line of input.lines) {
      if (line.quantity <= 0) {
        throw new Error("INVALID_STATE: Order line quantity must be greater than zero");
      }
      const createdLine = await this.orderLineRepo.create(
        {
          orderId: order.id,
          variantId: line.variantId,
          quantity: line.quantity,
          quantityReserved: 0,
          quantityShipped: 0,
        },
        tx
      );
      createdLines.push(createdLine);
    }

    return this.mapToDTO(order, createdLines);
  }

  async getOrderWithLines(orderId: string, tx?: unknown): Promise<OrderDTO> {
    const order = await this.orderRepo.findById(orderId, tx);
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const lines = await this.orderLineRepo.findByOrderId(orderId, tx);
    return this.mapToDTO(order, lines);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, tx?: unknown): Promise<OrderDTO> {
    const order = await this.orderRepo.updateStatus(orderId, status, tx);
    const lines = await this.orderLineRepo.findByOrderId(orderId, tx);
    return this.mapToDTO(order, lines);
  }

  async updateLineReserved(lineId: string, quantityReserved: number, tx?: unknown): Promise<FulfillmentOrderLineEntity> {
    if (quantityReserved < 0) {
      throw new Error("INVALID_STATE: Reserved quantity cannot be negative");
    }
    return this.orderLineRepo.updateReserved(lineId, quantityReserved, tx);
  }

  async updateLineShipped(lineId: string, quantityShipped: number, tx?: unknown): Promise<FulfillmentOrderLineEntity> {
    if (quantityShipped < 0) {
      throw new Error("INVALID_STATE: Shipped quantity cannot be negative");
    }
    return this.orderLineRepo.updateShipped(lineId, quantityShipped, tx);
  }

  private mapToDTO(order: FulfillmentOrderEntity, lines: FulfillmentOrderLineEntity[]): OrderDTO {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      lines: lines.map((line) => ({
        id: line.id,
        orderId: line.orderId,
        variantId: line.variantId,
        quantity: line.quantity,
        quantityReserved: line.quantityReserved,
        quantityShipped: line.quantityShipped,
      })),
    };
  }
}
