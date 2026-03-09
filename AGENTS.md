# erp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-10

## Active Technologies

- TypeScript 5.x with strict mode + Elysia 1.4+, Next.js 16+, React 19+, Kysely ORM, TanStack Form/Query (001-product-variants)

## Project Structure

```text
src/
├── app/                    # Next.js app router pages
├── modules/                # Domain modules (products, organizations, etc.)
│   └── [module]/
│       ├── domain/         # Pure types/entities (no deps)
│       ├── application/    # Use cases, repository interfaces
│       ├── infrastructure/ # Repository implementations
│       └── presentation/   # API routes, React components, hooks
├── server/                 # Elysia server setup
└── shared/                 # Shared utilities, components, hooks
    ├── application/        # Shared types (pagination, etc.)
    ├── infrastructure/     # Database, migrations
    └── presentation/       # UI components, hooks, utils
```

## Commands

```bash
# Development
bun run dev              # Start Next.js dev server

# Build
bun run build            # Production build
bun run start            # Start production server

# Code Quality
bun run lint             # Run ESLint on all files

# Database (Kysely)
bun run db:migrate       # Run pending migrations
bun run db:migrate:create <name>  # Create new migration
bun run db:rollback      # Rollback last migration
bun run db:status        # List migration status
bun run db:codegen       # Regenerate DB types from schema
```

**Note**: Testing framework not yet configured. When adding tests:
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Run single test: `bun test <pattern>`

## Code Style

### TypeScript

- **Strict mode enabled** - No `any` types without explicit justification
- Use `type` over `interface` for simple type definitions
- Explicit return types on all exported functions
- Use `readonly` arrays and objects where mutation is not expected

### Imports

Order: External libs → Internal modules (`@/`) → Relative imports

```typescript
// 1. External libraries
import { Elysia } from "elysia";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 2. Internal modules (alias @/)
import { db } from "@/shared/infrastructure/database";
import type { ProductEntity } from "@/modules/products/domain/product.entity";

// 3. Relative imports (same module only)
import { productKeys } from "./product-keys";
import type { CreateProductInput } from "./types/product.types";
```

### Naming Conventions

- **Files**: kebab-case (e.g., `product-list-view.tsx`, `use-products-query.ts`)
- **Components**: PascalCase (e.g., `ProductListView`, `CreateProductModal`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProductQuery`, `useDebouncedValue`)
- **Types/Interfaces**: PascalCase (e.g., `ProductEntity`, `CreateProductInput`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `PRODUCT_SORT_FIELDS`)
- **Classes**: PascalCase (e.g., `ProductService`, `ProductRepositoryImpl`)
- **Query Keys**: camelCase object factories (e.g., `productKeys`, `userKeys`)

### Module Structure

Each module MUST follow clean architecture layering:

```
modules/[name]/
├── domain/
│   └── [entity].entity.ts
├── application/
│   ├── [entity].repository.ts    # Interface
│   ├── [entity].service.ts       # Business logic
│   └── types/
│       └── [entity].types.ts     # Input/Output types
├── infrastructure/
│   └── [entity].repository.impl.ts
└── presentation/
    ├── [entity].routes.ts
    ├── components/
    │   ├── [entity]-list-view.tsx
    │   ├── [entity]-view.tsx
    │   ├── create-[entity]-modal.tsx
    │   └── delete-[entity]-alert.tsx
    ├── hooks/
    │   ├── use-[entities]-query.ts
    │   ├── use-[entity]-query.ts
    │   ├── use-create-[entity]-mutation.ts
    │   ├── use-update-[entity]-mutation.ts
    │   ├── use-delete-[entity]-mutation.ts
    │   └── [entity]-keys.ts
    └── schemas/
        └── [entity]-schema.ts
```

### Error Handling

- Services throw descriptive errors
- Repository methods return `undefined` for not found (not null)
- API routes return typed error responses per status code
- React Query hooks show toast notifications on errors

### Validation (Zod)

- Define schemas in `presentation/schemas/` files
- Reuse schemas for API and form validation
- Export inferred types: `export type X = z.infer<typeof XSchema>`

### Database

- Primary keys use uuidv7 (time-sortable)
- All entities implement soft delete (`deletedAt` timestamp)
- Migrations in `src/shared/infrastructure/database/migrations/`
- Regenerate types after schema changes: `bun run db:codegen`

### React Components

- Use shadcn/ui components from `@/shared/presentation/components/ui`
- Client components: `'use client'` directive at top
- Server components: Async functions for data fetching
- Handle loading states with Skeleton UI
- Forms use `@tanstack/react-form` with Zod validation

### Query Pattern (TanStack Query)

```typescript
// Key factories in [entity]-keys.ts
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug) => [...productKeys.details(), slug] as const,
};

// Hooks for each operation
export function useProductsQuery(filters) { ... }
export function useCreateProductMutation() { ... }
```

### Dependency Injection

Services and repositories use constructor injection:

```typescript
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}
}
```

## Recent Changes

- 001-product-variants: Added TypeScript 5.x with strict mode + Elysia 1.4+, Next.js 16+, React 19+, Kysely ORM, TanStack Form/Query

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
