type FulfillmentOrderLineEntity = {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  quantityReserved: number;
  quantityShipped: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { FulfillmentOrderLineEntity };
