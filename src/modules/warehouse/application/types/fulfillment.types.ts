import type { OrderStatus } from "../../domain/fulfillment-order.entity";

export type OrderLineDTO = {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  quantityReserved: number;
  quantityShipped: number;
};

export type OrderDTO = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  lines?: OrderLineDTO[];
  createdAt: Date;
  updatedAt: Date;
};
