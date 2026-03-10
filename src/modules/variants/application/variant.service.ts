import type { VariantRepository } from "./variant.repository";
import type {
  CreateVariantInput,
  UpdateVariantInput,
  VariantFilters,
  VariantListOutput,
  BulkCreateVariantsInput,
  SkuAvailabilityResult,
} from "./types/variant.types";
import type { VariantEntity } from "../domain/variant.entity";
import { createDefaultVariant } from "../domain/variant.entity";

export class VariantService {
  constructor(private readonly repository: VariantRepository) {}

  async create(input: CreateVariantInput): Promise<VariantEntity> {
    const { available } = await this.repository.checkSkuAvailability(input.sku);

    if (!available) {
      throw new Error("SKU is already taken");
    }

    return this.repository.create(input);
  }

  async bulkCreate(input: BulkCreateVariantsInput): Promise<VariantEntity[]> {
    // Check all SKUs for uniqueness before inserting
    await Promise.all(
      input.variants.map(async (v) => {
        const { available } = await this.repository.checkSkuAvailability(v.sku);
        if (!available) {
          throw new Error(`SKU "${v.sku}" is already taken`);
        }
      }),
    );

    return this.repository.bulkCreate(input);
  }

  async findById(id: string): Promise<VariantEntity | undefined> {
    return this.repository.findById(id);
  }

  async findAll(filters: VariantFilters): Promise<VariantListOutput> {
    return this.repository.findAll(filters);
  }

  async update(id: string, input: UpdateVariantInput): Promise<VariantEntity> {
    if (input.sku !== undefined) {
      const { available } = await this.repository.checkSkuAvailability(
        input.sku,
        id,
      );
      if (!available) {
        throw new Error("SKU is already taken");
      }
    }

    return this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const variant = await this.repository.findById(id);

    if (!variant) {
      throw new Error("Variant not found");
    }

    return this.repository.delete(id);
  }

  async checkSkuAvailability(
    sku: string,
    excludeId?: string,
  ): Promise<SkuAvailabilityResult> {
    return this.repository.checkSkuAvailability(sku, excludeId);
  }

  /**
   * Creates a default variant for a product when no variants are provided.
   * Uses auto-generated SKU pattern: AUTO-{productId prefix}-{timestamp}
   */
  async createDefaultForProduct(productId: string): Promise<VariantEntity> {
    const defaults = createDefaultVariant(productId);
    return this.repository.create({
      productId: defaults.productId,
      sku: defaults.sku,
      basePrice: defaults.basePrice,
      currency: defaults.currency,
      isDefault: defaults.isDefault,
    });
  }
}
