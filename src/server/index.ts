import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { productRoutes } from "../modules/products/presentation/product.routes";
import { variantRoutes } from "../modules/variants/presentation/variant.routes";
import { auth } from "@/shared/presentation/libraries/auth/auth";

const corsOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"
    : "http://localhost:3000";

export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: corsOrigin,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .mount(auth.handler)
  .use(productRoutes)
  .use(variantRoutes);

export type App = typeof app;
