import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("inventory_events")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("entity_type", "varchar(100)", (col) => col.notNull())
    .addColumn("entity_id", "uuid", (col) => col.notNull())
    .addColumn("action", "varchar(100)", (col) => col.notNull())
    .addColumn("before_state", "jsonb")
    .addColumn("after_state", "jsonb")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("idx_events_entity")
    .on("inventory_events")
    .columns(["entity_type", "entity_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_events_entity").ifExists().execute();
  await db.schema.dropTable("inventory_events").ifExists().execute();
}
