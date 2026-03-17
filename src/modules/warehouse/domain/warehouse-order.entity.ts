export type OrderStatus = "draft" | "reserved" | "shipped" | "cancelled";

type WarehouseOrderEntity = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { WarehouseOrderEntity };
