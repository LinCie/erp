import type { InventoryEventEntity } from "../domain/inventory-event.entity";

export type CreateEventInput = {
  entityType: string;
  entityId: string;
  action: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
};

/**
 * Interface for event data access.
 * Methods accept an optional transaction context (tx) for atomic operations.
 */
export interface EventRepository {
  create(input: CreateEventInput, tx?: unknown): Promise<InventoryEventEntity>;
}
