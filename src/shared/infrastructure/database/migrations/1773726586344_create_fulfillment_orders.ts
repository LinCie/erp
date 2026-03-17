import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create order_status enum
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('draft', 'reserved', 'shipped', 'cancelled');
      END IF;
    END $$;
  `.execute(db);

  await db.schema
    .createTable("fulfillment_orders")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(db.fn("uuidv7")))
    .addColumn("order_number", "varchar(100)", (col) => col.notNull())
    .addColumn("status", sql`order_status`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo("now()"))
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await sql`
    CREATE UNIQUE INDEX uidx_orders_number_active 
    ON fulfillment_orders(order_number) 
    WHERE deleted_at IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX idx_orders_status_active 
    ON fulfillment_orders(status) 
    WHERE deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_orders_status_active").ifExists().execute();
  await db.schema.dropIndex("uidx_orders_number_active").ifExists().execute();
  await db.schema.dropTable("fulfillment_orders").ifExists().execute();

  // Drop order_status enum
  await sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        DROP TYPE order_status;
      END IF;
    END $$;
  `.execute(db);
}
