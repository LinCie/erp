import { Elysia } from "elysia";
import { z } from "zod";
import { ProductService } from "../application/product.service";
import { ProductRepositoryImpl } from "../infrastructure/product.repository.impl";
import { VariantService } from "@/modules/variants/application/variant.service";
import { VariantRepositoryImpl } from "@/modules/variants/infrastructure/variant.repository.impl";
import { authPlugin } from "@/server/middlewares/auth-middleware";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_SORT_ORDERS,
} from "../application/types/product.types";
import { productImageSchema } from "./schemas/create-product-schema";

const productService = new ProductService(
  new ProductRepositoryImpl(),
  new VariantService(new VariantRepositoryImpl()),
);

const ProductSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  images: z.array(productImageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const PaginationMetadataSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
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
          images: body.images,
          variants:
            body.variants && body.variants.length > 0
              ? body.variants
              : undefined,
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
      body: z.object({
        name: z.string().min(1).max(255),
        description: z.string().nullable(),
        slug: z.string().min(1).max(255),
        images: z.array(productImageSchema).optional(),
        variants: z
          .array(
            z.object({
              name: z.string().min(1).max(255),
              sku: z.string().min(3).max(50),
              basePrice: z.number().min(0),
              salePrice: z.number().min(0).optional(),
              costPrice: z.number().min(0).optional(),
              currency: z.string().length(3).optional(),
              isDefault: z.boolean().optional(),
            }),
          )
          .optional(),
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
      const sortBy = query.sortBy ?? "createdAt";
      const sortOrder = query.sortOrder ?? "desc";

      const result = await productService.findAll({
        organizationId: organization.id,
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        search: z.string().optional(),
        sortBy: z.enum(PRODUCT_SORT_FIELDS).optional(),
        sortOrder: z.enum(PRODUCT_SORT_ORDERS).optional(),
      }),
      response: {
        200: z.object({
          data: z.array(ProductSchema),
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
      params: z.object({
        slug: z.string(),
      }),
      query: z.object({
        excludeId: z.string().optional(),
      }),
      response: {
        200: z.object({
          isAvailable: z.boolean(),
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
      params: z.object({
        id: z.string(),
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
      params: z.object({
        slug: z.string(),
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
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().nullable().optional(),
        slug: z.string().min(1).max(255).optional(),
        images: z.array(productImageSchema).optional(),
      }),
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
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.void(),
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Delete a product",
      },
    },
  )
  .get(
    "/trash",
    async ({ query, organization }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const search = query.search ?? "";
      const sortBy = query.sortBy ?? "createdAt";
      const sortOrder = query.sortOrder ?? "desc";

      const result = await productService.findAllTrashed({
        organizationId: organization.id,
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        search: z.string().optional(),
        sortBy: z.enum(PRODUCT_SORT_FIELDS).optional(),
        sortOrder: z.enum(PRODUCT_SORT_ORDERS).optional(),
      }),
      response: {
        200: z.object({
          data: z.array(ProductSchema),
          metadata: PaginationMetadataSchema,
        }),
      },
      detail: {
        tags: ["Products"],
        summary: "List all trashed products",
      },
    },
  )
  .post(
    "/:id/restore",
    async ({ params, organization, status }) => {
      const product = await productService.findByIdIncludingDeleted({
        id: params.id,
      });

      if (!product) {
        return status(404, { error: "Product not found" });
      }

      if (product.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      if (!product.deletedAt) {
        return status(400, { error: "Product is not deleted" });
      }

      const restored = await productService.restore({
        id: params.id,
        organizationId: organization.id,
      });

      return restored;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: ProductSchema,
        400: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Restore a soft-deleted product",
      },
    },
  )
  .delete(
    "/:id/permanent",
    async ({ params, organization, status }) => {
      const product = await productService.findByIdIncludingDeleted({
        id: params.id,
      });

      if (!product) {
        return status(404, { error: "Product not found" });
      }

      if (product.organizationId !== organization.id) {
        return status(403, { error: "Forbidden" });
      }

      await productService.permanentDelete({
        id: params.id,
        organizationId: organization.id,
      });
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.void(),
        403: ErrorSchema,
        404: ErrorSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Permanently delete a product",
      },
    },
  );
