import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("products")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("organization_id", "uuid", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("slug", "varchar(255)", (col) => col.notNull())
    .addColumn("images", "jsonb", (col) => col.defaultTo(null))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("idx_products_name")
    .on("products")
    .column("name")
    .execute();

  await db.schema
    .createIndex("idx_products_slug")
    .on("products")
    .column("slug")
    .execute();

  await db.schema
    .createIndex("idx_products_org_slug_unique")
    .on("products")
    .columns(["organization_id", "slug"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("idx_products_name").ifExists().execute();
  await db.schema.dropIndex("idx_products_slug").ifExists().execute();
  await db.schema.dropIndex("idx_products_org_slug_unique").ifExists().execute();
  await db.schema.dropTable("products").ifExists().execute();
}
