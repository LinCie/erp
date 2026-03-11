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

/**
 * Core business logic for variant CRUD operations.
 *
 * Enforces SKU uniqueness across all active (non-deleted) variants
 * and handles default variant generation for products created
 * without explicit variant data.
 */
export class VariantService {
  constructor(private readonly repository: VariantRepository) {}

  /**
   * Creates a single variant after verifying SKU uniqueness.
   *
   * @throws {Error} "SKU is already taken" when the SKU conflicts with
   *   another active (non-deleted) variant in the database.
   */
  async create(input: CreateVariantInput): Promise<VariantEntity> {
    const { available } = await this.repository.checkSkuAvailability(input.sku);

    if (!available) {
      throw new Error("SKU is already taken");
    }

    return this.repository.create(input);
  }

  /**
   * Creates multiple variants in a single batch.
   *
   * Validates ALL SKUs concurrently before inserting any rows,
   * so the operation is atomic from the user's perspective:
   * either all variants are created or none are.
   *
   * Note: There is a small TOCTOU window between the check and the
   * insert. The database partial unique index on (sku) WHERE
   * deleted_at IS NULL provides the final safety net.
   */
  async bulkCreate(input: BulkCreateVariantsInput): Promise<VariantEntity[]> {
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

  /** Fetches a single variant by ID (returns undefined if not found or soft-deleted). */
  async findById(id: string): Promise<VariantEntity | undefined> {
    return this.repository.findById(id);
  }

  /** Lists all active variants for a product, ordered by creation date ascending. */
  async findAll(filters: VariantFilters): Promise<VariantListOutput> {
    return this.repository.findAll(filters);
  }

  /**
   * Updates a variant with partial data.
   *
   * Only re-checks SKU uniqueness when the SKU field itself is being
   * changed. The `excludeId` parameter ensures that the variant's
   * own current SKU doesn't trigger a false conflict.
   *
   * @throws {Error} "SKU is already taken" if the new SKU conflicts.
   */
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

  /**
   * Soft-deletes a variant (sets deleted_at timestamp).
   *
   * Verifies the variant exists and is not already deleted before
   * proceeding. Soft-deleted SKUs become eligible for reuse because
   * the partial unique index only covers rows with deleted_at IS NULL.
   *
   * @throws {Error} "Variant not found" if the variant doesn't exist.
   */
  async delete(id: string): Promise<void> {
    const variant = await this.repository.findById(id);

    if (!variant) {
      throw new Error("Variant not found");
    }

    return this.repository.delete(id);
  }

  /**
   * Checks whether a SKU is available (not used by any active variant).
   *
   * @param excludeId - Variant ID to exclude from the check (used when
   *   editing a variant to avoid a false conflict with its own SKU).
   */
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
