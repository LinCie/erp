export type OrderStatus = "draft" | "reserved" | "shipped" | "cancelled";

type FulfillmentOrderEntity = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { FulfillmentOrderEntity };
