import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("variants")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("product_id", "uuid", (col) =>
      col.notNull().references("products.id").onDelete("cascade"),
    )
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn("sku", "varchar(50)", (col) => col.notNull())
    .addColumn("base_price", "decimal(19, 4)", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("sale_price", "decimal(19, 4)")
    .addColumn("cost_price", "decimal(19, 4)")
    .addColumn("currency", "char(3)", (col) =>
      col.notNull().defaultTo("USD"),
    )
    .addColumn("is_default", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("images", "jsonb", (col) => col.defaultTo(null))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("deleted_at", "timestamptz")
    .addColumn("created_by", "uuid")
    .addColumn("updated_by", "uuid")
    .execute();

  await sql`
    CREATE UNIQUE INDEX idx_variants_sku_active 
    ON variants(sku) 
    WHERE deleted_at IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX idx_variants_product_id 
    ON variants(product_id) 
    WHERE deleted_at IS NULL
  `.execute(db);

  await sql`
    CREATE INDEX idx_variants_product_id_default 
    ON variants(product_id) 
    WHERE is_default = true AND deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_variants_sku_active").ifExists().execute();
  await db.schema.dropIndex("idx_variants_product_id").ifExists().execute();
  await db.schema
    .dropIndex("idx_variants_product_id_default")
    .ifExists()
    .execute();
  await db.schema.dropTable("variants").ifExists().execute();
}
