import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("inventory")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("variant_id", "uuid", (col) => col.notNull().references("variants.id"))
    .addColumn("location_id", "uuid", (col) => col.notNull().references("locations.id"))
    .addColumn("quantity_available", "integer", (col) =>
      col.notNull().defaultTo(0).check(sql`quantity_available >= 0`),
    )
    .addColumn("quantity_reserved", "integer", (col) =>
      col.notNull().defaultTo(0).check(sql`quantity_reserved >= 0`),
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await sql`
    CREATE UNIQUE INDEX uidx_inventory_variant_location_active 
    ON inventory(variant_id, location_id) 
    WHERE deleted_at IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX idx_inventory_variant_active 
    ON inventory(variant_id) 
    WHERE deleted_at IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX idx_inventory_location_active 
    ON inventory(location_id) 
    WHERE deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_inventory_location_active").ifExists().execute();
  await db.schema.dropIndex("idx_inventory_variant_active").ifExists().execute();
  await db.schema.dropIndex("uidx_inventory_variant_location_active").ifExists().execute();
  await db.schema.dropTable("inventory").ifExists().execute();
}
