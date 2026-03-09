# Research: Product Variants Module

**Date**: 2026-03-10 | **Feature**: Product Variants | **Branch**: 001-product-variants

## Database Schema Patterns

### Decision: Parent-Child Table Structure

**Rationale**: Clean separation of concerns - Products store metadata, Variants store concrete sellable units

**Schema Design**:
- `products` table: id, name, description, organization_id, created_at, updated_at, deleted_at
- `variants` table: id, product_id, sku, base_price, sale_price, cost_price, currency, created_at, updated_at, deleted_at
- Relationship: variants.product_id → products.id (1:N)

**Why not Attribute-Based (EAV)**: Too complex for MVP; can be migrated later if color/size needed

## SKU Uniqueness Enforcement

### Decision: Partial Unique Index with Soft Delete Support

**Implementation**:
```sql
CREATE UNIQUE INDEX idx_variants_sku_active 
ON variants(sku) 
WHERE deleted_at IS NULL;
```

**Rationale**:
- Prevents duplicate SKUs among active variants
- Allows SKU reuse after soft delete (data recovery scenario)
- Database-level enforcement prevents race conditions
- Application-layer validation for early UX feedback

**Alternative Rejected**: Multi-column (sku, deleted_at) unique index - fails because NULL != NULL in SQL

## Form Architecture: TanStack React Form Arrays

### Decision: Use mode="array" with Dynamic Field Management

**Pattern**:
```tsx
<form.Field name="variants" mode="array">
  {(field) => (
    <>
      {field.state.value.map((_, index) => (
        <form.Field key={index} name={`variants[${index}].sku`}>
          {(subField) => <Input ... />}
        </form.Field>
      ))}
      <button onClick={() => field.pushValue({ sku: '', price: 0 })}>
        Add Variant
      </button>
    </>
  )}
</form.Field>
```

**Benefits**:
- Type-safe nested field access with bracket notation
- Built-in array operations: pushValue, removeValue, swapValues
- Validation at item and array level
- Reactive updates when items added/removed

## Backend Architecture

### Decision: Nested Route Group with Product-Scoped Variants

**Pattern**:
```typescript
app.group('/products/:productId/variants', (app) =>
  app
    .get('/', getVariants)
    .post('/', createVariant)
    .put('/:variantId', updateVariant)
    .delete('/:variantId', deleteVariant)
)
```

**Rationale**:
- Variants are child resources of products
- URL hierarchy reflects data relationships
- Guards can verify product ownership once at group level
- Eden Treaty provides full type safety for nested routes

### Decision: Use jsonArrayFrom for Fetching Product with Variants

**Pattern**:
```typescript
.select([..., 
  jsonArrayFrom(
    eb.selectFrom('variants')
      .whereRef('variants.product_id', '=', 'products.id')
      .where('variants.deleted_at', 'is', null)
  ).as('variants')
])
```

**Benefits**:
- Single query fetches product + variants (N+1 prevention)
- Returns properly typed nested arrays
- Soft delete filtering applied consistently

## Component Architecture

### Decision: Server Page → Client View Pattern

**Structure**:
1. `page.tsx` (Server): Fetch product with variants, pass to View
2. `[entity]-view.tsx` (Client): Handle loading/error/data states
3. Table component for variants list
4. Dialog modals for create/edit/delete operations

**Components Needed**:
- `@shadcn/table` - Base table structure
- `@tanstack/react-table` - Data table with sorting/filtering
- `@shadcn/dialog` - Modal dialogs
- `@shadcn/dropdown-menu` - Row actions (edit/delete)

## Validation Strategy

### Decision: Zod Schemas Shared Between API and Forms

**Pattern**:
```typescript
// Shared schema
const variantSchema = z.object({
  sku: z.string().min(3).max(50),
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD')
});

// API validation
.post('/', async ({ body }) => { ... }, {
  body: z.object({ variants: z.array(variantSchema) })
});

// Form validation
useForm({
  validators: { onChange: z.object({ variants: z.array(variantSchema) }) }
});
```

## Query Key Factory Pattern

### Decision: Module-Specific Key Factories

**Pattern**:
```typescript
// hooks/product-keys.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  variants: (productId: string) => [...productKeys.detail(productId), 'variants'] as const,
};
```

**Benefits**:
- Centralized cache key management
- Easy invalidation patterns
- Consistent across queries

## Performance Considerations

### Decision: Optimistic for MVP Scale

**Assumptions**:
- Products per org: 1,000-10,000
- Variants per product: 2-10 (95th percentile < 20)
- Concurrent users: < 100

**Constraints**:
- SKU max length: 50 characters (supports most formats)
- Max variants per create/update: 50 (prevent abuse)
- Database query timeout: 5 seconds

**Optimization Strategies** (if needed later):
- Pagination for variants if products have 50+ variants
- Debounced SKU availability check (500ms)
- CDN for product images (future)

## Default Variant Generation

### Decision: Auto-Generate with Timestamp-Based SKU

**Pattern**:
```typescript
function generateDefaultVariant(productId: string): Variant {
  return {
    sku: `AUTO-${productId.slice(0, 8)}-${Date.now()}`,
    basePrice: 0,
    currency: 'USD',
    // ... other defaults
  };
}
```

**Rationale**:
- Timestamp ensures uniqueness even if called multiple times
- Product ID prefix aids debugging
- Follows "AUTO-" convention from spec

## Error Handling Patterns

### Decision: Status-Specific Responses with Eden Treaty

**Pattern**:
```typescript
.response({
  200: z.object({ data: variantSchema }),
  403: z.object({ error: z.string() }),
  404: z.object({ error: z.string() }),
  409: z.object({ error: z.string(), field: z.string() }) // SKU conflict
})
```

**Frontend Handling**:
- 403/404: Show error boundary/redirect
- 409: Highlight conflicting field with message
- Network errors: Retry with exponential backoff

## Soft Delete Implementation

### Decision: deletedAt Timestamp with Query Filtering

**Repository Pattern**:
```typescript
// Always filter deleted by default
async findByProductId(productId: string) {
  return db.selectFrom('variants')
    .where('product_id', '=', productId)
    .where('deleted_at', 'is', null) // Default filter
    .selectAll()
    .execute();
}

// Explicit include deleted when needed
async findByProductIdWithDeleted(productId: string) {
  return db.selectFrom('variants')
    .where('product_id', '=', productId)
    .selectAll()
    .execute();
}
```

## Alternatives Considered

1. **EAV Pattern for Variants**: Rejected - too complex, poor query performance
2. **SKU as Primary Key**: Rejected - need UUID for internal relationships
3. **Separate Variant Module Page**: Rejected - spec requires in-product UI
4. **GraphQL for Nested Queries**: Rejected - Eden Treaty provides sufficient type safety with REST

## Technical Context Summary

All unknowns from Technical Context now resolved:

- **Language/Version**: TypeScript 5.x (from Constitution)
- **Primary Dependencies**: Elysia 1.4+, Next.js 16+, Kysely, TanStack Form/Query
- **Storage**: PostgreSQL with Kysely migrations
- **Testing**: Vitest for unit, Playwright for E2E
- **Target Platform**: Web (Next.js App Router + Elysia backend)
- **Project Type**: ERP web application with layered architecture
- **Performance Goals**: Support 10k products, < 200ms p95 for variant operations
- **Constraints**: SKU 3-50 chars, max 50 variants per operation
- **Scale/Scope**: MVP for product-variant relationship

## References

- [Elysia Nested Routes](https://elysiajs.com/patterns/nested-routes.html)
- [Kysely jsonArrayFrom](https://kysely-org.github.io/kysely-apidoc/interfaces/SelectQueryBuilder.html#select)
- [TanStack Form Arrays](https://tanstack.com/form/latest/docs/framework/react/guides/arrays)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)
