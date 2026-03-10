import { db } from "@/shared/infrastructure/database";
import type { Selectable } from "kysely";
import type { Variants } from "@/shared/infrastructure/database/types";
import type {
  CreateVariantInput,
  UpdateVariantInput,
  VariantFilters,
  VariantListOutput,
  BulkCreateVariantsInput,
  SkuAvailabilityResult,
} from "../application/types/variant.types";
import type { VariantRepository } from "../application/variant.repository";
import type { VariantEntity } from "../domain/variant.entity";

export class VariantRepositoryImpl implements VariantRepository {
  async create(input: CreateVariantInput): Promise<VariantEntity> {
    // If this variant is the new default, clear the existing default first
    if (input.isDefault) {
      await this.unsetCurrentDefault(input.productId);
    }

    const variant = await db
      .insertInto("variants")
      .values({
        productId: input.productId,
        sku: input.sku,
        basePrice: input.basePrice,
        salePrice: input.salePrice ?? null,
        costPrice: input.costPrice ?? null,
        currency: input.currency ?? "USD",
        isDefault: input.isDefault ?? false,
        createdBy: input.createdBy ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(variant);
  }

  async bulkCreate(input: BulkCreateVariantsInput): Promise<VariantEntity[]> {
    const defaultCount = input.variants.filter((v) => v.isDefault).length;
    if (defaultCount > 1) {
      throw new Error("Only one variant can be marked as default");
    }

    // If a default is being set, clear any existing default first
    if (defaultCount === 1) {
      await this.unsetCurrentDefault(input.productId);
    }

    const rows = input.variants.map((v) => ({
      productId: input.productId,
      sku: v.sku,
      basePrice: v.basePrice,
      salePrice: v.salePrice ?? null,
      costPrice: v.costPrice ?? null,
      currency: v.currency ?? "USD",
      isDefault: v.isDefault ?? false,
      createdBy: v.createdBy ?? null,
    }));

    if (rows.length === 0) return [];

    const variants = await db
      .insertInto("variants")
      .values(rows)
      .returningAll()
      .execute();

    return variants.map(this.mapToEntity);
  }

  async findById(id: string): Promise<VariantEntity | undefined> {
    const variant = await db
      .selectFrom("variants")
      .selectAll()
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst();

    return variant ? this.mapToEntity(variant) : undefined;
  }

  async findAll(filters: VariantFilters): Promise<VariantListOutput> {
    let query = db
      .selectFrom("variants")
      .selectAll()
      .where("productId", "=", filters.productId);

    if (!filters.includeDeleted) {
      query = query.where("deletedAt", "is", null);
    }

    const variants = await query.orderBy("createdAt", "asc").execute();
    const total = variants.length;

    return {
      data: variants.map(this.mapToEntity),
      meta: { total },
    };
  }

  async update(id: string, input: UpdateVariantInput): Promise<VariantEntity> {
    const updateData: Partial<{
      sku: string;
      basePrice: number;
      salePrice: number | null;
      costPrice: number | null;
      currency: string;
      isDefault: boolean;
      updatedBy: string | null;
    }> = {};

    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.basePrice !== undefined) updateData.basePrice = input.basePrice;
    if (input.salePrice !== undefined)
      updateData.salePrice = input.salePrice ?? null;
    if (input.costPrice !== undefined)
      updateData.costPrice = input.costPrice ?? null;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;
    if (input.updatedBy !== undefined)
      updateData.updatedBy = input.updatedBy ?? null;

    // If promoting this variant to default, clear the existing default first
    if (input.isDefault === true) {
      const current = await db
        .selectFrom("variants")
        .select("productId")
        .where("id", "=", id)
        .executeTakeFirst();
      if (current) {
        await this.unsetCurrentDefault(current.productId, id);
      }
    }

    const variant = await db
      .updateTable("variants")
      .set({ ...updateData, updatedAt: new Date() })
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(variant);
  }

  async delete(id: string): Promise<void> {
    await db
      .updateTable("variants")
      .set({ deletedAt: new Date() })
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .execute();
  }

  async checkSkuAvailability(
    sku: string,
    excludeId?: string,
  ): Promise<SkuAvailabilityResult> {
    let query = db
      .selectFrom("variants")
      .select("id")
      .where("sku", "=", sku)
      .where("deletedAt", "is", null);

    if (excludeId) {
      query = query.where("id", "!=", excludeId);
    }

    const existing = await query.executeTakeFirst();

    return {
      available: !existing,
      existingVariantId: existing?.id,
    };
  }

  /**
   * Clears isDefault on all active variants for a product,
   * optionally excluding a specific variant ID (used during update).
   */
  private async unsetCurrentDefault(
    productId: string,
    excludeId?: string,
  ): Promise<void> {
    let query = db
      .updateTable("variants")
      .set({ isDefault: false })
      .where("productId", "=", productId)
      .where("isDefault", "=", true)
      .where("deletedAt", "is", null);

    if (excludeId) {
      query = query.where("id", "!=", excludeId);
    }

    await query.execute();
  }

  private mapToEntity(variant: Selectable<Variants>): VariantEntity {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      basePrice: Number(variant.basePrice),
      salePrice: variant.salePrice !== null ? Number(variant.salePrice) : null,
      costPrice: variant.costPrice !== null ? Number(variant.costPrice) : null,
      currency: variant.currency,
      isDefault: variant.isDefault,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      deletedAt: variant.deletedAt,
      createdBy: variant.createdBy,
      updatedBy: variant.updatedBy,
    };
  }
}
