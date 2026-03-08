import { treaty } from "@elysiajs/eden"
import type { App } from "@/server"

const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"

export const api = treaty<App>(baseUrl, {
  fetch: {
    credentials: "include",
  },
})

export type ApiClient = typeof api
