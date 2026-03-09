# Data Model: Product Variants

**Module**: Variants | **Related**: Products | **Date**: 2026-03-10

## Entity: Variant

Represents a sellable version of a product with unique SKU and pricing.

### Database Schema

```sql
-- Migration: 001_add_variants_table.sql
CREATE TABLE variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Identification
    sku VARCHAR(50) NOT NULL,
    
    -- Pricing
    base_price DECIMAL(19, 4) NOT NULL DEFAULT 0,
    sale_price DECIMAL(19, 4),
    cost_price DECIMAL(19, 4),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Metadata
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps & Soft Delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE UNIQUE INDEX idx_variants_sku_active 
    ON variants(sku) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_variants_product_id 
    ON variants(product_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_variants_product_id_default 
    ON variants(product_id) 
    WHERE is_default = TRUE AND deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_variants
    BEFORE UPDATE ON variants
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
```

### Domain Entity (TypeScript)

```typescript
// src/modules/variants/domain/variant.entity.ts

export interface Variant {
  id: string;                    // UUID v7
  productId: string;             // Parent product reference
  
  // Identification
  sku: string;                   // 3-50 chars, unique across system
  
  // Pricing
  basePrice: number;             // Base sell price
  salePrice?: number;            // Optional discounted price
  costPrice?: number;            // Optional cost for margin calc
  currency: string;              // ISO 4217 (e.g., 'USD')
  
  // State
  isDefault: boolean;            // Auto-generated when no variants provided
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Factory for default variant generation
export function createDefaultVariant(productId: string): Omit<Variant, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    productId,
    sku: `AUTO-${productId.slice(0, 8)}-${Date.now()}`,
    basePrice: 0,
    currency: 'USD',
    isDefault: true,
  };
}
```

### Application Types

```typescript
// src/modules/variants/application/types/variant.types.ts

// Repository Inputs
export interface CreateVariantInput {
  productId: string;
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
}

export interface UpdateVariantInput {
  sku?: string;
  basePrice?: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
}

export interface VariantFilters {
  productId: string;
  includeDeleted?: boolean;
}

// Repository Outputs
export interface VariantListOutput {
  data: Variant[];
  meta: {
    total: number;
  };
}

// Service-specific types
export interface BulkCreateVariantsInput {
  productId: string;
  variants: Array<Omit<CreateVariantInput, 'productId'>>;
}

export interface SkuAvailabilityResult {
  available: boolean;
  existingVariantId?: string;
}
```

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         Product                             │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                               │
│ name: string                                                │
│ description: string                                         │
│ organizationId: UUID                                        │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Variant                              │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                               │
│ productId: UUID (FK → Product.id)                           │
│ sku: string (Unique, partial index)                         │
│ basePrice: number                                           │
│ salePrice?: number                                          │
│ costPrice?: number                                          │
│ currency: string                                            │
│ isDefault: boolean                                          │
│ deletedAt?: timestamp (Soft delete)                         │
└─────────────────────────────────────────────────────────────┘
```

## Validation Rules

### SKU Validation

| Rule | Constraint | Level |
|------|------------|-------|
| Required | Cannot be empty | Zod schema |
| Length | Min 3, Max 50 characters | Zod schema |
| Format | Alphanumeric + hyphens, underscores | Zod schema (regex) |
| Uniqueness | Must be unique across all active variants | Database + App |
| Case Sensitivity | "SKU-001" ≠ "sku-001" | Database collation |
| Whitespace | Trimmed, no leading/trailing spaces | Zod transform |

### Pricing Validation

| Field | Type | Constraints |
|-------|------|-------------|
| basePrice | number | ≥ 0, required |
| salePrice | number | ≥ 0, optional, typically ≤ basePrice |
| costPrice | number | ≥ 0, optional |
| currency | string | 3-letter ISO code, defaults to 'USD' |

### Business Rules

1. **Minimum One Variant**: Every product must have at least one variant
   - Automatically generate default variant if none provided during product creation
   - Prevent deletion of last variant (either block or auto-generate new default)

2. **SKU Uniqueness**: SKU must be globally unique across all variants (not just per-product)
   - Enforced at database level via partial unique index
   - Application validates before submission for UX

3. **Default Variant**: Exactly one variant per product should be marked as default
   - Auto-generated variant is always default
   - When adding first manual variant, can mark as default
   - When deleting default variant, another should become default

4. **Soft Delete**: All deletions are soft (deletedAt timestamp)
   - Allows data recovery
   - Preserves historical references (orders, invoices)
   - SKUs can be reused after soft delete

## State Transitions

```
┌──────────────┐    Create     ┌──────────────┐
│   No Variant │ ─────────────▶ │   Variant    │
│   (implicit) │                │   (active)   │
└──────────────┘                └──────────────┘
                                        │
                                        │ Update
                                        ▼
                               ┌──────────────┐
                               │   Variant    │
                               │   (updated)  │
                               └──────────────┘
                                        │
                                        │ Delete
                                        ▼
                               ┌──────────────┐
                               │   Variant    │
                               │ (soft-deleted)│
                               └──────────────┘
```

## Query Patterns

### Fetch Product with Variants

```typescript
// Using jsonArrayFrom for single-query fetch
const productWithVariants = await db
  .selectFrom('products')
  .where('products.id', '=', productId)
  .where('products.deleted_at', 'is', null)
  .select([
    'products.id',
    'products.name',
    'products.description',
    // ... other product fields
  ])
  .select((eb) => [
    jsonArrayFrom(
      eb.selectFrom('variants')
        .whereRef('variants.product_id', '=', 'products.id')
        .where('variants.deleted_at', 'is', null)
        .select([
          'variants.id',
          'variants.sku',
          'variants.base_price',
          'variants.sale_price',
          'variants.cost_price',
          'variants.currency',
          'variants.is_default',
        ])
        .orderBy('variants.created_at', 'asc')
    ).as('variants')
  ])
  .executeTakeFirst();
```

### Check SKU Availability

```typescript
// For real-time validation (debounced in UI)
const existing = await db
  .selectFrom('variants')
  .where('sku', '=', sku)
  .where('deleted_at', 'is', null)
  .where('id', '!=', excludeVariantId) // Optional: exclude self on update
  .select(['id'])
  .executeTakeFirst();

return { available: !existing };
```

### Get Default Variant

```typescript
const defaultVariant = await db
  .selectFrom('variants')
  .where('product_id', '=', productId)
  .where('is_default', '=', true)
  .where('deleted_at', 'is', null)
  .selectAll()
  .executeTakeFirst();
```

## Migration Considerations

### Backwards Compatibility

1. **Existing Products**: Migration should generate default variants for all existing products without variants
2. **Existing Orders**: Order line items likely reference products; ensure they can resolve to variant (may need default variant assignment)

### Data Integrity

```sql
-- Post-migration: Generate defaults for products without variants
INSERT INTO variants (product_id, sku, base_price, currency, is_default, created_at, updated_at)
SELECT 
    p.id,
    'AUTO-' || LEFT(p.id::text, 8) || '-' || EXTRACT(EPOCH FROM NOW())::bigint,
    0,
    'USD',
    true,
    NOW(),
    NOW()
FROM products p
LEFT JOIN variants v ON p.id = v.product_id AND v.deleted_at IS NULL
WHERE v.id IS NULL;
```

## Indexes for Performance

| Index | Purpose |
|-------|---------|
| `idx_variants_sku_active` | Enforce SKU uniqueness, fast SKU lookups |
| `idx_variants_product_id` | Fast variant list by product |
| `idx_variants_product_id_default` | Fast default variant lookup |

## Notes

- Currency is stored as 3-character code (ISO 4217) - no exchange rate logic in this module
- Prices stored as DECIMAL(19,4) to support high-precision financial calculations
- Variant attributes (color, size, etc.) out of scope for MVP - can be added as JSONB column later if needed
- Inventory quantity tracking out of scope - only pricing and identification in this phase
