import { Elysia, t } from "elysia";
import { ProductService } from "../application/product.service";
import { ProductRepositoryImpl } from "../infrastructure/product.repository.impl";
import { authPlugin } from "@/server/middlewares/auth-middleware";

const productService = new ProductService(new ProductRepositoryImpl());

const ProductSchema = t.Object({
  id: t.String(),
  organizationId: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  slug: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
});

const ErrorSchema = t.Object({
  error: t.String(),
});

const PaginationMetadataSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

export const productRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, organization, status }) => {
      try {
        const product = await productService.create({
          name: body.name,
          description: body.description ?? null,
          slug: body.slug,
          organizationId: organization.id,
        });

        return product;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Slug is already taken"
        ) {
          return status(409, { error: "Slug is already taken" });
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Union([t.String(), t.Null()]),
        slug: t.String({ minLength: 1, maxLength: 255 }),
      }),
      response: {
        200: ProductSchema,
        409: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Create a new product",
      },
    },
  )
  .get(
    "/",
    async ({ query, organization }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const search = query.search ?? "";

      const result = await productService.findAll({
        organizationId: organization.id,
        page,
        limit,
        search,
      });
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        search: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          data: t.Array(ProductSchema),
          metadata: PaginationMetadataSchema,
        }),
      },
      detail: {
        tags: ["Products"],
        summary: "List all products",
      },
    },
  )
  .get(
    "/check-slug/:slug",
    async ({ params, query, organization }) => {
      const result = await productService.checkSlugUniqueness({
        organizationId: organization.id,
        slug: params.slug,
        excludeId: query.excludeId,
      });

      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        slug: t.String(),
      }),
      query: t.Object({
        excludeId: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          isAvailable: t.Boolean(),
        }),
      },
      detail: {
        tags: ["Products"],
        summary: "Check if a product slug is available",
      },
    },
  )
  .get(
    "/:id",
    async ({ params, organization, status }) => {
      const product = await productService.findById({ id: params.id });

      if (!product) {
        return status(404, { error: "Product not found" });
      }

      if (product.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      return product;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ProductSchema,
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Get a product by ID",
      },
    },
  )
  .get(
    "/slug/:slug",
    async ({ params, organization, status }) => {
      const product = await productService.findBySlug({
        organizationId: organization.id,
        slug: params.slug,
      });

      if (!product) {
        return status(404, { error: "Product not found" });
      }

      if (product.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      return product;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        slug: t.String(),
      }),
      response: {
        200: ProductSchema,
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Get a product by slug",
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body, organization, status }) => {
      const existingProduct = await productService.findById({ id: params.id });

      if (!existingProduct) {
        return status(404, { error: "Product not found" });
      }

      if (existingProduct.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      try {
        const product = await productService.update({
          id: params.id,
          organizationId: organization.id,
          ...body,
        });

        return product;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Slug is already taken"
        ) {
          return status(409, { error: "Slug is already taken" });
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Partial(
        t.Object({
          name: t.String({ minLength: 1, maxLength: 255 }),
          description: t.Union([t.String(), t.Null()]),
          slug: t.String({ minLength: 1, maxLength: 255 }),
        }),
      ),
      response: {
        200: ProductSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Update a product",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params, organization, status }) => {
      const existingProduct = await productService.findById({ id: params.id });

      if (!existingProduct) {
        return status(404, { error: "Product not found" });
      }

      if (existingProduct.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      await productService.delete({ id: params.id });
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Void(),
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Delete a product",
      },
    },
  );
