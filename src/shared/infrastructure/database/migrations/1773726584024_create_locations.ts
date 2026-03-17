import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("locations")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("type", "varchar(50)", (col) => col.notNull())
    .addColumn("parent_id", "uuid", (col) => col.references("locations.id"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await sql`
    CREATE INDEX idx_locations_parent_active 
    ON locations(parent_id) 
    WHERE deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_locations_parent_active").ifExists().execute();
  await db.schema.dropTable("locations").ifExists().execute();
}
