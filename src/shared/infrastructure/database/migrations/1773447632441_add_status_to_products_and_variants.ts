import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived')`.execute(db);

  await db.schema
    .alterTable("products")
    .addColumn("status", sql`product_status`, (col) => col.notNull().defaultTo("draft"))
    .execute();

  await db.schema
    .createIndex("idx_products_status")
    .on("products")
    .column("status")
    .execute();

  await db.schema
    .alterTable("variants")
    .addColumn("status", sql`product_status`, (col) => col.notNull().defaultTo("draft"))
    .execute();

  await db.schema
    .createIndex("idx_variants_status")
    .on("variants")
    .column("status")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_variants_status").ifExists().execute();
  await db.schema.dropIndex("idx_products_status").ifExists().execute();

  await db.schema.alterTable("variants").dropColumn("status").execute();
  await db.schema.alterTable("products").dropColumn("status").execute();

  await sql`DROP TYPE IF EXISTS product_status`.execute(db);
}
