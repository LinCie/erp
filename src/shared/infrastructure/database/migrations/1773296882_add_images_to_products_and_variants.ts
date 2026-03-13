import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("products")
    .addColumn("images", "jsonb", (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .alterTable("variants")
    .addColumn("images", "jsonb", (col) => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("variants").dropColumn("images").execute();
  await db.schema.alterTable("products").dropColumn("images").execute();
}
