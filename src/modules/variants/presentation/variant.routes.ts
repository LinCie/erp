import { Elysia } from "elysia";
import { z } from "zod";
import { VariantService } from "../application/variant.service";
import { VariantRepositoryImpl } from "../infrastructure/variant.repository.impl";
import { authPlugin } from "@/server/middlewares/auth-middleware";
import type { VariantStatus } from "../domain/variant.entity";
import {
  createVariantSchema,
  updateVariantSchema,
  bulkCreateSchema,
  checkSkuQuerySchema,
  VARIANT_STATUS_OPTIONS,
} from "./schemas/variant-schema";

const variantService = new VariantService(new VariantRepositoryImpl());

export const variantRoutes = new Elysia({
  prefix: "/products/:id/variants",
})
  .use(authPlugin)
  .post(
    "/",
    async ({ params, body, status }) => {
      try {
        const variant = await variantService.create({
          productId: params.id,
          ...body,
        });
        return variant;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "SKU is already taken"
        ) {
          return status(409, { error: "SKU is already taken" });
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({ id: z.string().uuid() }),
      body: createVariantSchema,
      detail: {
        tags: ["Variants"],
        summary: "Create a variant for a product",
      },
    },
  )
  .post(
    "/bulk",
    async ({ params, body, status }) => {
      try {
        const variants = await variantService.bulkCreate({
          productId: params.id,
          variants: body.variants,
        });
        return { data: variants };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("SKU") &&
          error.message.includes("already taken")
        ) {
          return status(409, { error: error.message });
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({ id: z.string().uuid() }),
      body: bulkCreateSchema,
      detail: {
        tags: ["Variants"],
        summary: "Bulk create variants for a product",
      },
    },
  )
  .get(
    "/",
    async ({ params, query }) => {
      const result = await variantService.findAll({
        productId: params.id,
        status: query?.status as VariantStatus | undefined,
      });
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({ id: z.string().uuid() }),
      query: z.object({
        status: z.enum(VARIANT_STATUS_OPTIONS).optional(),
      }).optional(),
      detail: {
        tags: ["Variants"],
        summary: "List all variants for a product",
      },
    },
  )
  // GET /products/:productId/variants/check-sku — check SKU availability
  .get(
    "/check-sku",
    async ({ query }) => {
      const result = await variantService.checkSkuAvailability(
        query.sku,
        query.excludeId,
      );
      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({ id: z.string().uuid() }),
      query: checkSkuQuerySchema,
      detail: {
        tags: ["Variants"],
        summary: "Check SKU availability",
      },
    },
  )
  // PATCH /products/:productId/variants/:variantId — update a variant
  .patch(
    "/:variantId",
    async ({ params, body, status }) => {
      try {
        const variant = await variantService.update(params.variantId, body);
        return variant;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "SKU is already taken") {
            return status(409, { error: "SKU is already taken" });
          }
          if (error.message === "Variant not found") {
            return status(404, { error: "Variant not found" });
          }
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({
        id: z.string().uuid(),
        variantId: z.string().uuid(),
      }),
      body: updateVariantSchema,
      detail: {
        tags: ["Variants"],
        summary: "Update a variant",
      },
    },
  )
  // DELETE /products/:productId/variants/:variantId — soft delete a variant
  .delete(
    "/:variantId",
    async ({ params, status }) => {
      try {
        await variantService.delete(params.variantId);
      } catch (error) {
        if (error instanceof Error && error.message === "Variant not found") {
          return status(404, { error: "Variant not found" });
        }
        throw error;
      }
    },
    {
      requireAuth: true,
      requireOrg: true,
      params: z.object({
        id: z.string().uuid(),
        variantId: z.string().uuid(),
      }),
      detail: {
        tags: ["Variants"],
        summary: "Delete a variant",
      },
    },
  );
