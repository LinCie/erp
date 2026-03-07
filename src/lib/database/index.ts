import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export interface Database {
  // Add your custom tables here
  // Better Auth tables are managed internally
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
})
