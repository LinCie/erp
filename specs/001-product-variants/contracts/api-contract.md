# API Contract: Variants Module

**Base Path**: `/api/products/:productId/variants` | **Version**: 1 | **Date**: 2026-03-10

## Overview

Variants are child resources of Products. All endpoints are nested under the product path to maintain resource hierarchy. Authentication required via session token (better-auth).

## Endpoints

### List Variants

```
GET /api/products/:productId/variants
```

Returns all non-deleted variants for a product.

**Request Parameters**:
```typescript
{
  productId: string;  // Path param - UUID of parent product
}
```

**Response 200**:
```typescript
{
  data: Array<{
    id: string;
    productId: string;
    sku: string;
    basePrice: number;
    salePrice: number | null;
    costPrice: number | null;
    currency: string;
    isDefault: boolean;
    createdAt: string;  // ISO 8601
    updatedAt: string;  // ISO 8601
  }>;
  meta: {
    total: number;
  };
}
```

**Response 403**: Forbidden (no access to product)
```typescript
{
  error: "Access denied to this product";
}
```

**Response 404**: Product not found
```typescript
{
  error: "Product not found";
}
```

### Get Single Variant

```
GET /api/products/:productId/variants/:variantId
```

Returns a specific variant by ID.

**Response 200**: Same shape as list item above

**Response 404**: Variant not found
```typescript
{
  error: "Variant not found";
}
```

### Create Variant

```
POST /api/products/:productId/variants
```

Creates a new variant for the product. SKU must be unique across all active variants.

**Request Body**:
```typescript
{
  sku: string;              // Required, 3-50 chars, unique
  basePrice: number;        // Required, >= 0
  salePrice?: number;       // Optional, >= 0
  costPrice?: number;       // Optional, >= 0
  currency?: string;        // Optional, 3-letter code, default 'USD'
  isDefault?: boolean;      // Optional, default false
}
```

**Response 201**:
```typescript
{
  data: {
    id: string;
    productId: string;
    sku: string;
    basePrice: number;
    salePrice: number | null;
    costPrice: number | null;
    currency: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Response 400**: Validation error
```typescript
{
  error: "Validation failed";
  details: Array<{
    field: string;
    message: string;
  }>;
}
```

**Response 409**: SKU already exists
```typescript
{
  error: "SKU already in use";
  field: "sku";
  existingVariantId?: string;
}
```

### Bulk Create Variants

```
POST /api/products/:productId/variants/bulk
```

Creates multiple variants in a single request (used during product creation).

**Request Body**:
```typescript
{
  variants: Array<{
    sku: string;
    basePrice: number;
    salePrice?: number;
    costPrice?: number;
    currency?: string;
  }>;  // Max 50 items
}
```

**Response 201**:
```typescript
{
  data: Array<Variant>;  // All created variants
  meta: {
    created: number;
  };
}
```

**Response 409**: One or more SKUs conflict
```typescript
{
  error: "Duplicate SKUs detected";
  conflicts: Array<{
    sku: string;
    index: number;  // Position in request array
    existingVariantId?: string;
  }>;
}
```

### Update Variant

```
PUT /api/products/:productId/variants/:variantId
PATCH /api/products/:productId/variants/:variantId
```

Updates variant fields. SKU can be changed but must remain unique.

**Request Body**:
```typescript
{
  sku?: string;             // Optional, must be unique if provided
  basePrice?: number;       // Optional, >= 0
  salePrice?: number;       // Optional, >= 0
  costPrice?: number;       // Optional, >= 0
  currency?: string;        // Optional, 3-letter code
  isDefault?: boolean;      // Optional
}
```

**Response 200**:
```typescript
{
  data: Variant;  // Updated variant
}
```

**Response 400**: Validation error (same shape as create)

**Response 404**: Variant not found

**Response 409**: SKU conflict
```typescript
{
  error: "SKU already in use by another variant";
  field: "sku";
  existingVariantId: string;
}
```

### Delete Variant

```
DELETE /api/products/:productId/variants/:variantId
```

Soft-deletes a variant. If this is the last variant, returns error (product must have at least one).

**Response 200**:
```typescript
{
  success: true;
  data: {
    id: string;
    deletedAt: string;  // ISO 8601 timestamp
  };
}
```

**Response 400**: Cannot delete last variant
```typescript
{
  error: "Cannot delete the last variant of a product";
  code: "LAST_VARIANT";
}
```

**Response 404**: Variant not found

### Check SKU Availability

```
GET /api/variants/check-sku?sku=SKU-001&excludeId=optional-uuid
```

Checks if a SKU is available (not in use by another active variant). Used for real-time validation.

**Query Parameters**:
```typescript
{
  sku: string;           // Required, SKU to check
  excludeId?: string;    // Optional, exclude this variant ID (for updates)
}
```

**Response 200**:
```typescript
{
  available: boolean;
  existingVariantId?: string;  // If not available
  message?: string;            // Human-readable message
}
```

## Error Handling

All errors follow consistent structure:

```typescript
{
  error: string;           // Human-readable error message
  code?: string;           // Machine-readable error code
  details?: unknown;       // Additional context (validation errors, etc.)
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Not authenticated | 401 |
| `FORBIDDEN` | No permission for resource | 403 |
| `NOT_FOUND` | Resource doesn't exist | 404 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `SKU_CONFLICT` | SKU already in use | 409 |
| `LAST_VARIANT` | Attempted to delete last variant | 400 |
| `DUPLICATE_SKUS` | Multiple SKUs in request conflict | 409 |

## TypeScript Contracts

### Zod Schemas (Shared)

```typescript
// src/modules/variants/presentation/schemas/variant-schema.ts
import { z } from 'zod';

export const variantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().min(3).max(50).regex(/^[a-zA-Z0-9-_]+$/),
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).nullable(),
  costPrice: z.number().min(0).nullable(),
  currency: z.string().length(3).default('USD'),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createVariantSchema = variantSchema.pick({
  sku: true,
  basePrice: true,
  salePrice: true,
  costPrice: true,
  currency: true,
  isDefault: true,
}).partial({
  salePrice: true,
  costPrice: true,
  currency: true,
  isDefault: true,
});

export const updateVariantSchema = createVariantSchema.partial();

export const bulkCreateSchema = z.object({
  variants: z.array(createVariantSchema).max(50),
});

export type Variant = z.infer<typeof variantSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
```

### Elysia Route Definition

```typescript
// src/modules/variants/presentation/variant.routes.ts
import { Elysia } from 'elysia';
import { variantService } from '../application/variant.service';
import { 
  variantSchema, 
  createVariantSchema, 
  updateVariantSchema,
  bulkCreateSchema 
} from './schemas/variant-schema';

export const variantRoutes = new Elysia({ prefix: '/products/:productId/variants' })
  .guard({
    params: z.object({ productId: z.string().uuid() }),
  })
  .get('/', async ({ params, user }) => {
    const variants = await variantService.findByProductId(params.productId, user.organizationId);
    return { data: variants, meta: { total: variants.length } };
  }, {
    response: {
      200: z.object({
        data: z.array(variantSchema),
        meta: z.object({ total: z.number() }),
      }),
      403: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
    },
  })
  .post('/', async ({ params, body, user }) => {
    const variant = await variantService.create({
      ...body,
      productId: params.productId,
    }, user.id);
    return { data: variant };
  }, {
    body: createVariantSchema,
    response: {
      201: z.object({ data: variantSchema }),
      400: z.object({ error: z.string(), details: z.array(z.any()) }),
      409: z.object({ error: z.string(), field: z.string() }),
    },
  })
  // ... additional routes
```

### Eden Treaty Client Types

```typescript
// Types are automatically inferred from Elysia routes
// Usage in frontend:

import { treaty } from '@elysiajs/eden';
import type { App } from '@/app';

const api = treaty<App>('http://localhost:3000');

// Fully typed client
const { data, error } = await api.products({ productId: 'uuid' }).variants.get();

// Types automatically available:
// - data.data: Variant[]
// - error: { error: string } | { error: string, field: string }
```

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| All variant endpoints | 100 | 1 minute |
| SKU availability check | 30 | 1 minute |
| Bulk create | 10 | 1 minute |

## Webhooks (Future)

Future considerations for real-time updates:

```
Event: variant.created
Event: variant.updated  
Event: variant.deleted (soft)
```

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-10 | Initial API design |
