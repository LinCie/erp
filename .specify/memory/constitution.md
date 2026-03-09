<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.2.0
Modified Principles:
  - I. Component-Based Architecture (expanded to include presentation patterns)
  - II. API-First Design with Type Contracts (expanded validation guidance)
  - V. Database Migration Discipline (added soft delete pattern)
Added Sections:
  - VI. Layered Architecture with Dependency Inversion
  - VII. Repository Pattern with Explicit Contracts
  - VIII. Soft Delete Pattern
  - IX. Query Pattern with Key Factories
  - X. Form Pattern with TanStack React Form
  - XI. Validation with Zod
Removed Sections:
  - None (constitution expanded)
Templates Requiring Updates:
  - ✅ None (all templates align with new principles)
  - ⚠️ Consider creating: module-template.md for consistent module structure
Follow-up TODOs: None
-->

# ERP Constitution

## Core Principles

### I. Component-Based Architecture with Presentation Patterns

All UI MUST be built as reusable, self-contained components using TypeScript with strict mode.
Presentation components SHOULD follow the layered pattern: async page components (server) delegate to client view components.
View components MUST handle loading (Skeleton UI), error, and data states explicitly.
Components MUST use shadcn/ui patterns for consistency.

**Rationale**: Reusable components reduce duplication and improve maintainability. The server-to-client delegation pattern enables SSR where beneficial while keeping interactivity in client components. Skeleton UI provides perceived performance and better UX.

### II. API-First Design with Type Contracts and Eden Treaty

Backend APIs using Elysia MUST define explicit TypeScript contracts. All endpoints MUST have corresponding request/response type definitions that are shared between frontend and backend via @elysiajs/eden treaty.
Route validation MUST use Zod schemas with explicit response schemas per status code (200, 403, 404, 409, etc.).

**Rationale**: Eden Treaty provides end-to-end type safety without code generation. Explicit contracts prevent runtime errors, enable IDE autocomplete, and document the API surface area. Status-specific response schemas improve error handling.

### III. Type Safety (NON-NEGOTIABLE)

TypeScript strict mode MUST be enabled. Database types MUST be generated via Kysely codegen (kysely-codegen) and kept in sync with migrations. No `any` types allowed without explicit justification.
All repository and service methods MUST have explicit Input/Output type definitions.

**Rationale**: Type safety catches errors at compile time, reduces runtime bugs, and improves refactoring confidence. Generated DB types ensure code matches the schema. Explicit method contracts improve code clarity.

### IV. Test-Driven Development

New features MUST include tests: unit tests for business logic, integration tests for API endpoints, and contract tests for critical paths. Tests MUST be written before or alongside implementation.

**Rationale**: TDD ensures requirements are understood before coding, provides regression protection, and documents expected behavior. Integration tests catch API contract violations.

### V. Database Migration Discipline

All database schema changes MUST go through Kysely migrations. Migrations MUST be reviewed for backwards compatibility. Types MUST be regenerated after each migration.
Primary keys MUST use uuidv7. Indexes MUST be added for frequently queried fields.

**Rationale**: Version-controlled migrations enable safe schema evolution across environments. uuidv7 provides time-sortable unique identifiers. Backwards-compatible changes allow zero-downtime deployments.

### VI. Layered Architecture with Dependency Inversion

Modules MUST follow clean architecture layering:
- **Domain**: Pure types and entities (no dependencies)
- **Application**: Use cases, repository interfaces, service interfaces
- **Infrastructure**: Repository implementations, external service clients
- **Presentation**: API routes, React components, hooks

Dependencies MUST point inward: Presentation -> Infrastructure -> Application -> Domain.
Services and repositories MUST use dependency injection via constructors.

**Rationale**: Clear separation of concerns enables testing, swapping implementations, and understanding code at a glance. Dependency injection improves testability and flexibility.

### VII. Repository Pattern with Explicit Contracts

Repositories MUST be defined as interfaces in the Application layer and implemented in Infrastructure.
All repository methods MUST have explicit Input/Output types (e.g., CreateProductInput, CreateProductOutput).
Repository implementations MUST map database types to domain entities via explicit mapping methods.
Pagination MUST use a consistent metadata pattern across all list operations.

**Rationale**: Repository interfaces decouple business logic from data access. Explicit contracts prevent accidental breaking changes. Entity mapping ensures type safety across boundaries. Consistent pagination improves UX predictability.

### VIII. Soft Delete Pattern

All entities requiring deletion MUST implement soft delete using a deletedAt timestamp field.
Repository queries MUST filter deleted records unless explicitly requested otherwise.
Unique constraints MUST account for soft deletes (e.g., organization_id + slug + deleted_at).

**Rationale**: Soft deletes enable data recovery, audit trails, and referential integrity preservation. Filtering by default prevents accidental access to deleted data.

### IX. Query Pattern with Key Factories

Frontend data fetching MUST use @tanstack/react-query with signal support for cancellation.
Query keys MUST be organized via centralized factory functions (e.g., productKeys, userKeys) defined in module-specific hooks.
Query hooks MUST handle errors with user-friendly messages.

**Rationale**: Query key factories ensure cache consistency and simplify invalidation. Signal support enables request cancellation for better performance. Centralized error handling improves UX consistency.

### X. Form Pattern with TanStack React Form

Forms MUST use @tanstack/react-form with Zod validation schemas.
Async validation (e.g., availability checks) MUST use debouncing (500ms default) with signal support.
Form fields MUST use the render prop pattern with form.Field.
Submit handlers MUST handle success (close modal, reset form) and error states explicitly.

**Rationale**: TanStack React Form provides excellent type safety and performance. Debounced async validation reduces server load. Explicit state handling improves UX and error recovery.

### XI. Validation with Zod

All data validation MUST use Zod 4.x. Validation rules MUST be inline (min, max, regex) and exported as TypeScript types via z.infer.
API routes MUST validate request bodies, query params, and path params with Zod.
Form validation MUST reuse the same schemas as API validation where applicable.

**Rationale**: Zod provides runtime validation with TypeScript inference. Shared schemas between API and forms ensure consistency. Inline rules are self-documenting.

### XII. Bun-First Toolchain (NON-NEGOTIABLE)

Bun MUST be used as the exclusive package manager and runtime for all development tasks. All `package.json` scripts MUST use `bun run` instead of `npm run` or `npx`. The `bun.lock` file MUST be committed and kept in sync. No `node_modules` should be installed via npm or yarn.

**Rationale**: Bun provides faster package installation (10-100x faster than npm/yarn), better monorepo support, and native TypeScript execution. Using a single toolchain eliminates configuration conflicts and ensures consistent behavior across all environments (local, CI, production).

## Technology Standards

**Language**: TypeScript 5.x with strict mode
**Package Manager**: Bun (MUST use `bun install`, `bun run` for all scripts)
**Frontend**: Next.js 16+ with App Router, React 19+
**Backend**: Elysia 1.4+ (Bun runtime) - MUST be run via `bun run`
**Database**: PostgreSQL via Kysely ORM with kysely-codegen
**Authentication**: better-auth 1.5+ with @daveyplate/better-auth-ui
**State Management**: @tanstack/react-query 5+
**Forms**: @tanstack/react-form with Zod validation
**Styling**: Tailwind CSS v4 with shadcn/ui v4 components
**Tables**: @tanstack/react-table 8+
**API Client**: @elysiajs/eden treaty for type-safe API calls
**Testing**: Vitest for unit, Playwright for E2E
**UUID**: @homarr/uuidv7 for time-sortable primary keys

## Development Workflow

1. All features start with a specification in `.specify/specs/`
2. Use `bun install` to add dependencies (never npm/yarn)
3. Use `bun run <script>` to execute all package.json scripts
4. Database changes require migration review before deployment
5. Migration types must be regenerated: `bun run db:codegen`
6. API changes require contract test updates
7. PRs must pass type checking (`bun run lint`), and tests
8. Complex changes require architectural review
9. Module structure must follow: domain/ → application/ → infrastructure/ → presentation/
10. All new entities must implement soft delete pattern
11. All repository methods must have explicit Input/Output types
12. Query keys must use centralized factory functions

## Module Structure

Each module MUST follow this directory structure:
```
src/modules/[module-name]/
├── domain/
│   └── [entity].entity.ts          # Domain types (pure TypeScript)
├── application/
│   ├── [entity].repository.ts      # Repository interface
│   ├── [entity].service.ts         # Business logic
│   └── types/
│       └── [entity].types.ts       # Input/Output types
├── infrastructure/
│   └── [entity].repository.impl.ts # Kysely implementation
└── presentation/
    ├── [entity].routes.ts          # Elysia routes with Zod
    ├── components/                 # React components
    │   ├── [entity]-list-view.tsx
    │   ├── [entity]-view.tsx
    │   ├── create-[entity]-modal.tsx
    │   ├── edit-[entity]-modal.tsx
    │   └── delete-[entity]-alert.tsx
    ├── hooks/
    │   ├── use-[entities]-query.ts
    │   ├── use-[entity]-query.ts
    │   └── [entity]-keys.ts        # Query key factory
    └── schemas/
        └── [entity]-schema.ts      # Zod schemas
```

## Governance

This constitution is the authoritative source for project standards. All code reviews MUST verify compliance with these principles.

**Amendment Process**:
- Minor changes (clarifications, examples): PR with reviewer approval
- Major changes (principle additions/removals): Team discussion + documented rationale
- Breaking changes: Version bump + migration plan for existing code

**Compliance Review**: Quarterly review of codebase against constitution. Non-compliant code must be refactored or granted exception with documented justification.

**Version**: 1.2.0 | **Ratified**: 2026-03-07 | **Last Amended**: 2026-03-10
