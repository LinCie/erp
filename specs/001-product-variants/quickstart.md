# Quickstart: Product Variants Module

**Feature**: Product Variants | **Branch**: `001-product-variants` | **Last Updated**: 2026-03-10

## Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- PostgreSQL 14+ running locally or accessible
- Existing products module (dependency)

## Setup

### 1. Checkout Branch

```bash
git checkout 001-product-variants
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Database Setup

```bash
# Run migration
bun run db:migrate

# Generate types from schema
bun run db:codegen
```

### 4. Environment Variables

Ensure these are set in `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/erp_db
# ... other existing env vars
```

## Development

### Start Development Server

```bash
# Start Nextjs
bun run dev
```

### Running Tests

```bash
# Unit tests
bun test
```

### Type Checking

```bash
bun run typecheck
```

### Linting

```bash
bun run lint
```

## Module Structure Quick Reference

```
src/modules/variants/
├── domain/
│   └── variant.entity.ts              # Pure TypeScript types
├── application/
│   ├── variant.repository.ts          # Interface
│   ├── variant.service.ts             # Business logic
│   └── types/
│       └── variant.types.ts           # Input/Output types
├── infrastructure/
│   └── variant.repository.impl.ts     # Kysely implementation
└── presentation/
    ├── variant.routes.ts              # API routes
    ├── components/
    │   ├── variant-list-view.tsx      # Table display
    │   ├── variant-form-fields.tsx    # Reusable fields
    │   ├── create-variant-modal.tsx   # Add variant dialog
    │   └── delete-variant-alert.tsx   # Delete confirmation
    ├── hooks/
│   │   ├── use-variants-query.ts
│   │   ├── use-create-variant-mutation.ts
│   │   ├── use-update-variant-mutation.ts
│   │   ├── use-delete-variant-mutation.ts
│   │   └── variant-keys.ts
    └── schemas/
        └── variant-schema.ts          # Zod schemas
```

## Key Implementation Patterns

### Creating a Variant

```typescript
// Frontend component
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { createVariantSchema } from '@/modules/variants/presentation/schemas/variant-schema';

const form = useForm({
  defaultValues: {
    sku: '',
    basePrice: 0,
    currency: 'USD',
  },
  validators: {
    onChange: createVariantSchema,
  },
});
```

### Fetching Variants

```typescript
// Using React Query with key factory
import { useQuery } from '@tanstack/react-query';
import { variantKeys } from '@/modules/variants/presentation/hooks/variant-keys';

const { data: variants } = useQuery({
  queryKey: variantKeys.list(productId),
  queryFn: () => api.products({ productId }).variants.get(),
});
```

### Adding Variant to Product Form

```typescript
// Parent form with variants array
<form.Field name="variants" mode="array">
  {(field) => (
    <>
      {field.state.value.map((_, index) => (
        <div key={index}>
          <form.Field name={`variants[${index}].sku`}>
            {(subField) => (
              <Input 
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <button onClick={() => field.removeValue(index)}>Remove</button>
        </div>
      ))}
      
      <button onClick={() => field.pushValue({ sku: '', basePrice: 0 })}>
        Add Variant
      </button>
    </>
  )}
</form.Field>
```

## Common Tasks

### Add New Field to Variant

1. Update `domain/variant.entity.ts` - Add field to interface
2. Update database migration - Add column
3. Update `application/types/variant.types.ts` - Add to Input types
4. Update `presentation/schemas/variant-schema.ts` - Add Zod validation
5. Update `infrastructure/variant.repository.impl.ts` - Add to queries
6. Update `presentation/components/variant-form-fields.tsx` - Add UI field

### Testing New Endpoint

```bash
# Using curl
curl -X POST http://localhost:3000/api/products/123/variants \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{
    "sku": "TEST-001",
    "basePrice": 99.99,
    "currency": "USD"
  }'
```

### Debugging Type Errors

```bash
# Regenerate database types after schema changes
bun run db:codegen

# Check for type errors
bun run typecheck

# Run lint
bun run lint
```

## Database Queries

### Check Variants Table

```sql
-- List all variants for a product
SELECT v.*, p.name as product_name
FROM variants v
JOIN products p ON v.product_id = p.id
WHERE v.product_id = 'your-product-uuid'
AND v.deleted_at IS NULL;

-- Check for duplicate SKUs
SELECT sku, COUNT(*) as count
FROM variants
WHERE deleted_at IS NULL
GROUP BY sku
HAVING COUNT(*) > 1;

-- Find products without variants
SELECT p.*
FROM products p
LEFT JOIN variants v ON p.id = v.product_id AND v.deleted_at IS NULL
WHERE v.id IS NULL;
```

## Troubleshooting

### "SKU already exists" error

- Check if SKU exists in deleted variants: `SELECT * FROM variants WHERE sku = 'YOUR-SKU'`
- Note: Soft-deleted variants allow SKU reuse, so check `deleted_at` column

### Variants not appearing in list

- Verify `deleted_at IS NULL` filter is applied
- Check product_id matches exactly (UUID format)
- Ensure user has organization access

### Type errors after migration

1. Run `bun run db:codegen` to regenerate types
2. Restart TypeScript server in IDE
3. Check that kysely-codegen is using correct DATABASE_URL

### Query performance issues

- Ensure indexes exist: `\d variants` (in psql)
- Check for N+1 queries - use `jsonArrayFrom` for nested data
- Add EXPLAIN ANALYZE to slow queries

## Related Documentation

- [Feature Specification](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-contract.md)
- [Research Findings](./research.md)
- [ERP Constitution](../../.specify/memory/constitution.md)

## Support

For questions about implementation patterns, refer to:
- [TanStack Form Arrays](https://tanstack.com/form/latest/docs/framework/react/guides/arrays)
- [Kysely jsonArrayFrom](https://kysely-org.github.io/kysely-apidoc/interfaces/SelectQueryBuilder.html#select)
- [Elysia Nested Routes](https://elysiajs.com/patterns/nested-routes.html)
