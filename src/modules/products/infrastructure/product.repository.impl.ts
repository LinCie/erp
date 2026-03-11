import { db } from "@/shared/infrastructure/database";
import type { Selectable } from "kysely";
import type { Products } from "@/shared/infrastructure/database/types";
import type {
  CreateProductInput,
  CreateProductOutput,
  FindProductByIdInput,
  FindProductByIdOutput,
  FindProductByIdIncludingDeletedInput,
  FindProductByIdIncludingDeletedOutput,
  FindProductBySlugInput,
  FindProductBySlugOutput,
  FindAllProductsInput,
  FindAllProductsOutput,
  UpdateProductInput,
  UpdateProductOutput,
  DeleteProductInput,
  DeleteProductOutput,
  CheckSlugUniquenessInput,
  CheckSlugUniquenessOutput,
  FindAllTrashedProductsInput,
  FindAllTrashedProductsOutput,
  RestoreProductInput,
  RestoreProductOutput,
  PermanentDeleteProductInput,
  PermanentDeleteProductOutput,
} from "../application/types/product.types";
import type { ProductRepository } from "../application/product.repository";
import type { ProductEntity } from "../domain/product.entity";

export class ProductRepositoryImpl implements ProductRepository {
  async create(input: CreateProductInput): Promise<CreateProductOutput> {
    const product = await db
      .insertInto("products")
      .values({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        slug: input.slug,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(product);
  }

  async findById(input: FindProductByIdInput): Promise<FindProductByIdOutput> {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", input.id)
      .where("deletedAt", "is", null)
      .executeTakeFirst();

    return product ? this.mapToEntity(product) : undefined;
  }

  async findByIdIncludingDeleted(
    input: FindProductByIdIncludingDeletedInput,
  ): Promise<FindProductByIdIncludingDeletedOutput> {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", input.id)
      .executeTakeFirst();

    return product ? this.mapToEntity(product) : undefined;
  }

  async findBySlug(
    input: FindProductBySlugInput,
  ): Promise<FindProductBySlugOutput> {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("organizationId", "=", input.organizationId)
      .where("slug", "=", input.slug)
      .where("deletedAt", "is", null)
      .executeTakeFirst();

    return product ? this.mapToEntity(product) : undefined;
  }

  async findAll(input: FindAllProductsInput): Promise<FindAllProductsOutput> {
    const offset = (input.page - 1) * input.limit;

    let baseQuery = db
      .selectFrom("products")
      .where("organizationId", "=", input.organizationId)
      .where("deletedAt", "is", null);

    if (input.search) {
      const escaped = input.search.replace(/[\\%_]/g, (ch) => `\\${ch}`);
      baseQuery = baseQuery.where("name", "ilike", `%${escaped}%`);
    }

    const [products, countResult] = await Promise.all([
      baseQuery
        .selectAll()
        .orderBy(input.sortBy, input.sortOrder)
        .limit(input.limit)
        .offset(offset)
        .execute(),
      baseQuery.select((eb) => eb.fn.countAll().as("count")).executeTakeFirst(),
    ]);

    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / input.limit);

    return {
      data: products.map(this.mapToEntity),
      metadata: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
      },
    };
  }

  async update(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const updateData: Partial<{
      name: string;
      description: string | null;
      slug: string;
    }> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.slug !== undefined) {
      updateData.slug = input.slug;
    }

    const product = await db
      .updateTable("products")
      .set({ ...updateData, updatedAt: new Date() })
      .where("id", "=", input.id)
      .where("deletedAt", "is", null)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(product);
  }

  async delete(input: DeleteProductInput): Promise<DeleteProductOutput> {
    await db
      .updateTable("products")
      .set({ deletedAt: new Date() })
      .where("id", "=", input.id)
      .where("deletedAt", "is", null)
      .execute();
  }

  private mapToEntity(product: Selectable<Products>): ProductEntity {
    return {
      id: product.id,
      organizationId: product.organizationId,
      name: product.name,
      description: product.description,
      slug: product.slug,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }

  async checkSlugUniqueness(
    input: CheckSlugUniquenessInput,
  ): Promise<CheckSlugUniquenessOutput> {
    let query = db
      .selectFrom("products")
      .select("id")
      .where("organizationId", "=", input.organizationId)
      .where("slug", "=", input.slug)
      .where("deletedAt", "is", null);

    if (input.excludeId) {
      query = query.where("id", "!=", input.excludeId);
    }

    const existing = await query.executeTakeFirst();

    return { isAvailable: !existing };
  }

  async findAllTrashed(
    input: FindAllTrashedProductsInput,
  ): Promise<FindAllTrashedProductsOutput> {
    const offset = (input.page - 1) * input.limit;

    let baseQuery = db
      .selectFrom("products")
      .where("organizationId", "=", input.organizationId)
      .where("deletedAt", "is not", null);

    if (input.search) {
      const escaped = input.search.replace(/[\\%_]/g, (ch) => `\\${ch}`);
      baseQuery = baseQuery.where("name", "ilike", `%${escaped}%`);
    }

    const [products, countResult] = await Promise.all([
      baseQuery
        .selectAll()
        .orderBy(input.sortBy, input.sortOrder)
        .limit(input.limit)
        .offset(offset)
        .execute(),
      baseQuery.select((eb) => eb.fn.countAll().as("count")).executeTakeFirst(),
    ]);

    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / input.limit);

    return {
      data: products.map(this.mapToEntity),
      metadata: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
      },
    };
  }

  async restore(input: RestoreProductInput): Promise<RestoreProductOutput> {
    const product = await db
      .updateTable("products")
      .set({ deletedAt: null, updatedAt: new Date() })
      .where("id", "=", input.id)
      .where("organizationId", "=", input.organizationId)
      .where("deletedAt", "is not", null)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(product);
  }

  async permanentDelete(
    input: PermanentDeleteProductInput,
  ): Promise<PermanentDeleteProductOutput> {
    await db
      .deleteFrom("products")
      .where("id", "=", input.id)
      .where("organizationId", "=", input.organizationId)
      .execute();
  }
}
