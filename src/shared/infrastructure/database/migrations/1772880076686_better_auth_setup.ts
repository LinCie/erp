import type { Kysely } from "kysely";
import { sql } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<unknown>): Promise<void> {
  // Create user table
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("email_verified", "boolean", (col) => col.notNull())
    .addColumn("image", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create session table
  await db.schema
    .createTable("session")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("active_organization_id", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) => col.notNull())
    .execute();

  // Create account table
  await db.schema
    .createTable("account")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("account_id", "text", (col) => col.notNull())
    .addColumn("provider_id", "text", (col) => col.notNull())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("access_token", "text")
    .addColumn("refresh_token", "text")
    .addColumn("id_token", "text")
    .addColumn("access_token_expires_at", "timestamptz")
    .addColumn("refresh_token_expires_at", "timestamptz")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) => col.notNull())
    .execute();

  // Create verification table
  await db.schema
    .createTable("verification")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create organization table
  await db.schema
    .createTable("organization")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("logo", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull())
    .addColumn("metadata", "text")
    .execute();

  // Create member table
  await db.schema
    .createTable("member")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("organization_id", "uuid", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull())
    .execute();

  // Create invitation table
  await db.schema
    .createTable("invitation")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("uuidv7")),
    )
    .addColumn("organization_id", "uuid", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("role", "text")
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn("inviter_id", "uuid", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex("session_user_id_idx")
    .on("session")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("account_user_id_idx")
    .on("account")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("verification_identifier_idx")
    .on("verification")
    .column("identifier")
    .execute();

  await db.schema
    .createIndex("member_organization_id_idx")
    .on("member")
    .column("organization_id")
    .execute();

  await db.schema
    .createIndex("member_user_id_idx")
    .on("member")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("invitation_organization_id_idx")
    .on("invitation")
    .column("organization_id")
    .execute();

  await db.schema
    .createIndex("invitation_email_idx")
    .on("invitation")
    .column("email")
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex("invitation_email_idx").ifExists().execute();
  await db.schema
    .dropIndex("invitation_organization_id_idx")
    .ifExists()
    .execute();
  await db.schema.dropIndex("member_user_id_idx").ifExists().execute();
  await db.schema.dropIndex("member_organization_id_idx").ifExists().execute();
  await db.schema.dropIndex("verification_identifier_idx").ifExists().execute();
  await db.schema.dropIndex("account_user_id_idx").ifExists().execute();
  await db.schema.dropIndex("session_user_id_idx").ifExists().execute();

  // Drop tables in reverse order of creation
  await db.schema.dropTable("invitation").ifExists().execute();
  await db.schema.dropTable("member").ifExists().execute();
  await db.schema.dropTable("organization").ifExists().execute();
  await db.schema.dropTable("verification").ifExists().execute();
  await db.schema.dropTable("account").ifExists().execute();
  await db.schema.dropTable("session").ifExists().execute();
  await db.schema.dropTable("user").ifExists().execute();
}