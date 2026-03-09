# Implementation Plan: Product Variants Module

**Branch**: `001-product-variants` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-product-variants/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the existing products module with a variants system where each product can have multiple sellable variants with unique SKUs and independent pricing. Variants are created/managed within the product form using nested TanStack Form arrays. Implements SKU uniqueness enforcement via partial unique indexes, soft delete support, and follows ERP Constitution patterns for layered architecture and type safety.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Elysia 1.4+, Next.js 16+, React 19+, Kysely ORM, TanStack Form/Query  
**Storage**: PostgreSQL with Kysely migrations (kysely-codegen)  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web application (Next.js App Router + Elysia backend)  
**Project Type**: ERP web application with layered architecture  
**Performance Goals**: Support 10k products per org, <200ms p95 for variant operations  
**Constraints**: SKU 3-50 characters, max 50 variants per create/update operation, database query timeout 5s  
**Scale/Scope**: MVP for product-variant 1:N relationship, excludes attributes like color/size

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Gates (from ERP Constitution):**

- [x] **Component-Based Architecture**: UI uses reusable TypeScript components with shadcn/ui patterns
  - Table component for variants list (@tanstack/react-table)
  - Dialog modals for create/edit/delete
  - Form.Field with mode="array" for nested variant fields
  
- [x] **API-First Design**: New endpoints have explicit TypeScript contracts shared frontend/backend
  - Elysia routes with Zod validation
  - Eden Treaty for type-safe client calls
  - Status-specific response schemas (200, 403, 404, 409)
  
- [x] **Type Safety**: All code passes TypeScript strict mode; no `any` types without justification
  - Kysely codegen for database types
  - Explicit Input/Output types for all repository methods
  - Zod schemas inferred as TypeScript types
  
- [x] **Test-Driven**: Tests written for business logic and API contracts (unit/integration)
  - Unit tests for SKU validation logic
  - Integration tests for variant CRUD operations
  - Contract tests for API endpoints
  
- [x] **Database Discipline**: Schema changes have Kysely migration; types regenerated
  - Migration for variants table with product_id FK
  - Partial unique index for SKU uniqueness with soft deletes
  - kysely-codegen run after migration

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Follows ERP Constitution Module Structure:

```text
src/modules/variants/
├── domain/
│   └── variant.entity.ts          # Variant domain types (pure TypeScript)
├── application/
│   ├── variant.repository.ts      # Repository interface
│   ├── variant.service.ts         # Business logic (SKU validation, default generation)
│   └── types/
│       └── variant.types.ts       # CreateVariantInput, UpdateVariantInput, etc.
├── infrastructure/
│   └── variant.repository.impl.ts # Kysely implementation with jsonArrayFrom
└── presentation/
│   ├── variant.routes.ts          # Elysia nested routes /products/:id/variants
│   ├── components/
│   │   ├── variant-list-view.tsx      # Table of variants on product page
│   │   ├── variant-form-fields.tsx    # Reusable variant input fields
│   │   ├── create-variant-modal.tsx   # Dialog for adding single variant
│   │   └── delete-variant-alert.tsx   # Confirmation before delete
│   ├── hooks/
│   │   ├── use-variants-query.ts      # Fetch variants for product
│   │   ├── use-create-variant-mutation.ts
│   │   ├── use-update-variant-mutation.ts
│   │   ├── use-delete-variant-mutation.ts
│   │   └── variant-keys.ts            # Query key factory
│   └── schemas/
│       └── variant-schema.ts      # Zod schemas (shared with API)

src/modules/products/
├── presentation/
│   ├── components/
│   │   ├── product-form.tsx           # Updated to include variants array
│   │   └── product-detail-view.tsx    # Shows variants table
│   └── hooks/
│       └── use-create-product-with-variants.ts

# Existing structure continues to be used for other modules
src/modules/
├── products/               # Extended with variant integration
├── variants/               # NEW: Full variants module
└── [other modules]/

database/
└── migrations/
    └── 001_add_variants_table.sql   # With partial unique index

tests/
├── unit/
│   └── variants/
│       ├── variant.service.test.ts
│       └── variant.repository.test.ts
├── integration/
│   └── variants/
│       └── variant.routes.test.ts
└── e2e/
    └── variants.spec.ts
```

**Structure Decision**: Module-based architecture following ERP Constitution Section XII. Variants implemented as standalone module with clear dependency on products module (variants reference products). Nested within products presentation layer as per spec requirement (variants only shown on product detail page).

## Complexity Tracking

> No constitution violations. All gates pass. Design follows ERP Constitution patterns directly.
