/**
 * Post-migration script: Generate default variants for existing products.
 *
 * Finds all products that have no associated active (non-deleted) variants
 * and creates a default variant for each one using the same pattern as
 * VariantService.createDefaultForProduct().
 *
 * Usage:
 *   bun run scripts/generate-default-variants.ts
 *
 * Safe to run multiple times — it only touches products that currently
 * have zero active variants.
 */

import { db } from "@/shared/infrastructure/database";
import { sql } from "kysely";

async function generateDefaultVariants(): Promise<void> {
  console.log("🔍 Finding products without variants...\n");

  // Find all products that have no active (non-deleted) variants
  const productsWithoutVariants = await db
    .selectFrom("products")
    .select(["products.id", "products.name"])
    .where("products.deletedAt", "is", null)
    .where(({ not, exists, selectFrom }) =>
      not(
        exists(
          selectFrom("variants")
            .select(sql.lit(1).as("one"))
            .whereRef("variants.productId", "=", "products.id")
            .where("variants.deletedAt", "is", null),
        ),
      ),
    )
    .execute();

  if (productsWithoutVariants.length === 0) {
    console.log("✅ All products already have at least one variant. Nothing to do.\n");
    return;
  }

  console.log(
    `Found ${productsWithoutVariants.length} product(s) without variants:\n`,
  );

  for (const product of productsWithoutVariants) {
    console.log(`  • ${product.name} (${product.id})`);
  }

  console.log("\n🔧 Generating default variants...\n");

  let created = 0;
  let failed = 0;

  for (const product of productsWithoutVariants) {
    try {
      // Generate a default SKU matching the pattern from variant.entity.ts
      const sku = `AUTO-${product.id.slice(0, 8)}-${Date.now()}`;

      await db
        .insertInto("variants")
        .values({
          productId: product.id,
          name: "Default",
          sku,
          basePrice: 0,
          currency: "USD",
          isDefault: true,
        })
        .execute();

      console.log(`  ✅ Created default variant for "${product.name}" (SKU: ${sku})`);
      created++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `  ❌ Failed to create default variant for "${product.name}": ${message}`,
      );
      failed++;
    }
  }

  console.log(
    `\n📊 Done: ${created} created, ${failed} failed out of ${productsWithoutVariants.length} products.\n`,
  );
}

generateDefaultVariants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
