import type {
  CreateVariantInput,
  UpdateVariantInput,
  VariantFilters,
  VariantListOutput,
  BulkCreateVariantsInput,
  SkuAvailabilityResult,
} from "./types/variant.types";
import type { VariantEntity } from "../domain/variant.entity";

export interface VariantRepository {
  create(input: CreateVariantInput): Promise<VariantEntity>;
  bulkCreate(input: BulkCreateVariantsInput): Promise<VariantEntity[]>;
  findById(id: string): Promise<VariantEntity | undefined>;
  findAll(filters: VariantFilters): Promise<VariantListOutput>;
  update(id: string, input: UpdateVariantInput): Promise<VariantEntity>;
  delete(id: string): Promise<void>;
  checkSkuAvailability(
    sku: string,
    excludeId?: string,
  ): Promise<SkuAvailabilityResult>;
}
