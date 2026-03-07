import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { auth } from "../lib/auth/auth";
import { productRoutes } from "../modules/products/presentation/product.routes";

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
  .use(
    swagger({
      documentation: {
        tags: [
          { name: "Products", description: "Product management endpoints" },
        ],
      },
    }),
  )
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .mount(auth.handler)
  .use(productRoutes);

export type App = typeof app;
