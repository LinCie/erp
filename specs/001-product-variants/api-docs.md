# API Documentation: Variant Endpoints

**Base URL**: `/api/products/:productId/variants`  
**Authentication**: Required (session cookie)  
**Organization**: Required (user must belong to an organization)

---

## Endpoints

### `POST /api/products/:productId/variants`

Create a single variant for a product.

**Parameters**:

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `productId` | path | UUID | ✓ | Product to attach the variant to |

**Request Body**:

```json
{
  "sku": "PROD-BLUE-001",
  "basePrice": 49.99,
  "salePrice": 39.99,
  "costPrice": 20.00,
  "currency": "USD",
  "isDefault": false
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `sku` | string | ✓ | — | Unique identifier, 3-50 chars, alphanumeric + hyphens/underscores |
| `basePrice` | number | ✓ | — | Base selling price (≥ 0) |
| `salePrice` | number | — | — | Discounted price (≥ 0) |
| `costPrice` | number | — | — | Cost/wholesale price (≥ 0) |
| `currency` | string | — | `"USD"` | 3-character ISO currency code |
| `isDefault` | boolean | — | `false` | Whether this is the default variant |

**Responses**:

- `200` — Created variant (VariantEntity JSON)
- `409` — `{ "error": "SKU is already taken" }` — SKU conflicts with an active variant

---

### `POST /api/products/:productId/variants/bulk`

Create multiple variants for a product in a single request.

**Request Body**:

```json
{
  "variants": [
    { "sku": "PROD-SM", "basePrice": 40.00, "isDefault": true },
    { "sku": "PROD-MD", "basePrice": 45.00 },
    { "sku": "PROD-LG", "basePrice": 50.00 }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variants` | array | ✓ | Array of variant objects (max 50). Each follows the same schema as single create. |

**Responses**:

- `200` — `{ "data": VariantEntity[] }` — Array of created variants
- `409` — `{ "error": "SKU \"PROD-SM\" is already taken" }` — At least one SKU conflicts

**Notes**:
- All SKUs are validated for uniqueness **before** any are inserted (all-or-nothing).
- At most one variant in the batch may be marked as `isDefault`.

---

### `GET /api/products/:productId/variants`

List all active (non-deleted) variants for a product, ordered by creation date ascending.

**Parameters**:

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `productId` | path | UUID | ✓ | Product ID |

**Response** (`200`):

```json
{
  "data": [
    {
      "id": "01936f3a-...",
      "productId": "01936f2b-...",
      "sku": "PROD-001",
      "basePrice": 49.99,
      "salePrice": null,
      "costPrice": null,
      "currency": "USD",
      "isDefault": true,
      "createdAt": "2026-03-10T12:00:00.000Z",
      "updatedAt": "2026-03-10T12:00:00.000Z",
      "deletedAt": null,
      "createdBy": null,
      "updatedBy": null
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

### `GET /api/products/:productId/variants/check-sku`

Check whether a SKU is available (not in use by any active variant).

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sku` | string | ✓ | SKU to check (min 1 char, whitespace trimmed) |
| `excludeId` | UUID | — | Variant ID to exclude from the check (used during edits) |

**Response** (`200`):

```json
{
  "available": true,
  "existingVariantId": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `available` | boolean | `true` if the SKU is free to use |
| `existingVariantId` | string \| undefined | ID of the conflicting variant (if unavailable) |

---

### `PATCH /api/products/:productId/variants/:variantId`

Update a variant with partial data. Only fields present in the body are updated.

**Parameters**:

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `productId` | path | UUID | ✓ | Product ID |
| `variantId` | path | UUID | ✓ | Variant to update |

**Request Body**: Same fields as create, all optional.

```json
{
  "basePrice": 59.99,
  "salePrice": 49.99
}
```

**Responses**:

- `200` — Updated variant (VariantEntity JSON)
- `404` — `{ "error": "Variant not found" }` — Variant doesn't exist or is deleted
- `409` — `{ "error": "SKU is already taken" }` — New SKU conflicts

---

### `DELETE /api/products/:productId/variants/:variantId`

Soft-delete a variant (sets `deleted_at` timestamp). The variant's SKU becomes reusable.

**Parameters**:

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `productId` | path | UUID | ✓ | Product ID |
| `variantId` | path | UUID | ✓ | Variant to delete |

**Responses**:

- `200` — No body (success)
- `404` — `{ "error": "Variant not found" }` — Variant doesn't exist or is already deleted

---

## SKU Uniqueness

SKU uniqueness is enforced at two levels:

1. **Application layer**: `VariantService` checks SKU availability before create/update operations
2. **Database layer**: A partial unique index `ON variants (sku) WHERE deleted_at IS NULL` prevents duplicates at the storage level

Soft-deleted variants are excluded from uniqueness checks, allowing SKU reuse after deletion.

## Default Variant Behavior

- Each product should have exactly one default variant (`isDefault: true`)
- When a new variant is marked as default, the existing default is automatically cleared
- Products created without variants automatically receive a default variant with:
  - SKU pattern: `AUTO-{first 8 chars of productId}-{unix timestamp}`
  - Base price: `$0.00`
  - Currency: `USD`
