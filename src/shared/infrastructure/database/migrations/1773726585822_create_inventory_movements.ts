import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create movement_type enum
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
        CREATE TYPE movement_type AS ENUM ('receive', 'move', 'reserve', 'ship', 'adjust');
      END IF;
    END $$;
  `.execute(db);

  await db.schema
    .createTable("inventory_movements")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("variant_id", "uuid", (col) => col.notNull().references("variants.id"))
    .addColumn("from_location_id", "uuid", (col) => col.references("locations.id"))
    .addColumn("to_location_id", "uuid", (col) => col.references("locations.id"))
    .addColumn("quantity", "integer", (col) => col.notNull().check(sql`quantity > 0`))
    .addColumn("movement_type", sql`movement_type`, (col) => col.notNull())
    .addColumn("reference_type", "varchar(100)")
    .addColumn("reference_id", "uuid")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("idx_movements_variant")
    .on("inventory_movements")
    .column("variant_id")
    .execute();

  await db.schema
    .createIndex("idx_movements_from_location")
    .on("inventory_movements")
    .column("from_location_id")
    .execute();

  await db.schema
    .createIndex("idx_movements_to_location")
    .on("inventory_movements")
    .column("to_location_id")
    .execute();

  await db.schema
    .createIndex("idx_movements_reference")
    .on("inventory_movements")
    .columns(["reference_type", "reference_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_movements_reference").ifExists().execute();
  await db.schema.dropIndex("idx_movements_to_location").ifExists().execute();
  await db.schema.dropIndex("idx_movements_from_location").ifExists().execute();
  await db.schema.dropIndex("idx_movements_variant").ifExists().execute();
  await db.schema.dropTable("inventory_movements").ifExists().execute();

  // Drop movement_type enum
  await sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
        DROP TYPE movement_type;
      END IF;
    END $$;
  `.execute(db);
}
