import type { Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('variants')
		.addColumn('name', 'varchar(100)', (col) => col.notNull())
		.execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable('variants')
		.dropColumn('name')
		.execute()
}
