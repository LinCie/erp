import type { LocationEntity } from "../domain/location.entity";

/**
 * Interface for location data access.
 */
export interface LocationRepository {
  findById(id: string, tx?: unknown): Promise<LocationEntity | null>;
}
