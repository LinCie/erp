import { Elysia, t } from "elysia";
import { ProductService } from "../application/product.service";
import { ProductRepositoryImpl } from "../infrastructure/product.repository.impl";
import { authPlugin } from "@/server/middlewares/auth-middleware";

const productService = new ProductService(new ProductRepositoryImpl());

export const productRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, organization }) => {
      const product = await productService.create({
        name: body.name,
        description: body.description ?? null,
        slug: body.slug,
        organizationId: organization.id,
      });

      return product;
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Union([t.String(), t.Null()]),
        slug: t.String({ minLength: 1, maxLength: 255 }),
      }),
    },
  )
  .get(
    "/",
    async ({ query, organization }) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const result = await productService.findAll({
        organizationId: organization.id,
        page,
        limit,
      });
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      }),
    },
  )
  .get(
    "/:id",
    async ({ params, organization }) => {
      const product = await productService.findById({ id: params.id });

      if (!product) {
        return new Response("Product not found", { status: 404 });
      }

      if (product.organizationId !== organization.id) {
        return new Response("Forbidden", { status: 403 });
      }

      return product;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/slug/:slug",
    async ({ params, organization }) => {
      const product = await productService.findBySlug({
        organizationId: organization.id,
        slug: params.slug,
      });

      if (!product) {
        return new Response("Product not found", { status: 404 });
      }

      if (product.organizationId !== organization.id) {
        return new Response("Forbidden", { status: 403 });
      }

      return product;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        slug: t.String(),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params, body, organization }) => {
      const existingProduct = await productService.findById({ id: params.id });

      if (!existingProduct) {
        return new Response("Product not found", { status: 404 });
      }

      if (existingProduct.organizationId !== organization.id) {
        return new Response("Forbidden", { status: 403 });
      }

      const product = await productService.update({
        id: params.id,
        ...body,
      });

      return product;
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
    },
  )
  .delete(
    "/:id",
    async ({ params, organization }) => {
      const existingProduct = await productService.findById({ id: params.id });

      if (!existingProduct) {
        return new Response("Product not found", { status: 404 });
      }

      if (existingProduct.organizationId !== organization.id) {
        return new Response("Forbidden", { status: 403 });
      }

      await productService.delete({ id: params.id });

      return new Response(null, { status: 204 });
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  );
