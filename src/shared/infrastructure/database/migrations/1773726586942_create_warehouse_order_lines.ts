import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("warehouse_order_lines")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("order_id", "uuid", (col) => col.notNull().references("warehouse_orders.id"))
    .addColumn("variant_id", "uuid", (col) => col.notNull().references("variants.id"))
    .addColumn("quantity", "integer", (col) => col.notNull().check(sql`quantity > 0`))
    .addColumn("quantity_reserved", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("quantity_shipped", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("idx_order_lines_order")
    .on("warehouse_order_lines")
    .column("order_id")
    .execute();

  await db.schema
    .createIndex("idx_order_lines_variant")
    .on("warehouse_order_lines")
    .column("variant_id")
    .execute();

  await db.schema
    .createIndex("idx_order_lines_order_variant")
    .on("warehouse_order_lines")
    .columns(["order_id", "variant_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_order_lines_order_variant").ifExists().execute();
  await db.schema.dropIndex("idx_order_lines_variant").ifExists().execute();
  await db.schema.dropIndex("idx_order_lines_order").ifExists().execute();
  await db.schema.dropTable("warehouse_order_lines").ifExists().execute();
}
