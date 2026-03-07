import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "../lib/auth/auth";
import { authPlugin } from "./middlewares/auth-middleware";
import type { Session, User } from "better-auth";
import type { Organization } from "better-auth/plugins";

declare global {
  interface Request {
    user?: User;
    session?: Session;
    organization?: Organization;
  }
}

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
  .mount(auth.handler)
  .use(authPlugin)
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .get(
    "/protected",
    ({ request }) => {
      return {
        message: "Hello authenticated user!",
        user: request.user,
      };
    },
    { auth: true },
  );

export type App = typeof app;
