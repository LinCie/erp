<!--
SYNC IMPACT REPORT
==================
Version Change: N/A (Initial) → 1.0.0
Modified Principles: N/A (Initial creation)
Added Sections: All sections (initial constitution)
Removed Sections: None
Templates Requiring Updates: ⚠ None (new project)
Follow-up TODOs: None
-->

# ERP Constitution

## Core Principles

### I. Component-Based Architecture

All UI must be built as reusable, self-contained components. Components MUST use TypeScript for type safety and SHOULD leverage shadcn/ui patterns for consistency.

**Rationale**: Reusable components reduce duplication, improve maintainability, and enable parallel development. TypeScript ensures compile-time safety across the frontend.

### II. API-First Design with Type Contracts

Backend APIs using Elysia MUST define explicit TypeScript contracts. All endpoints MUST have corresponding request/response type definitions that are shared between frontend and backend.

**Rationale**: Explicit contracts prevent runtime errors, enable autocomplete in IDEs, and document the API surface area. Eden Treaty (from @elysiajs/eden) provides end-to-end type safety.

### III. Type Safety (NON-NEGOTIABLE)

TypeScript strict mode MUST be enabled. Database types MUST be generated via Kysely codegen and kept in sync with migrations. No `any` types allowed without explicit justification.

**Rationale**: Type safety catches errors at compile time, reduces runtime bugs, and improves refactoring confidence. Generated DB types ensure the code matches the schema.

### IV. Test-Driven Development

New features MUST include tests: unit tests for business logic, integration tests for API endpoints, and contract tests for critical paths. Tests MUST be written before or alongside implementation.

**Rationale**: TDD ensures requirements are understood before coding, provides regression protection, and documents expected behavior. Integration tests catch API contract violations.

### V. Database Migration Discipline

All database schema changes MUST go through Kysely migrations. Migrations MUST be reviewed for backwards compatibility. Types MUST be regenerated after each migration.

**Rationale**: Version-controlled migrations enable safe schema evolution across environments. Backwards-compatible changes allow zero-downtime deployments.

## Technology Standards

**Language**: TypeScript 5.x with strict mode
**Frontend**: Next.js 14+ with App Router
**Backend**: Elysia (Bun runtime)
**Database**: PostgreSQL via Kysely ORM
**Authentication**: better-auth with session management
**Styling**: Tailwind CSS with shadcn/ui components
**Testing**: Vitest for unit, Playwright for E2E

## Development Workflow

1. All features start with a specification in `.specify/specs/`
2. Database changes require migration review before deployment
3. API changes require contract test updates
4. PRs must pass type checking, linting, and tests
5. Complex changes require architectural review

## Governance

This constitution is the authoritative source for project standards. All code reviews MUST verify compliance with these principles.

**Amendment Process**:
- Minor changes (clarifications, examples): PR with reviewer approval
- Major changes (principle additions/removals): Team discussion + documented rationale
- Breaking changes: Version bump + migration plan for existing code

**Compliance Review**: Quarterly review of codebase against constitution. Non-compliant code must be refactored or granted exception with documented justification.

**Version**: 1.0.0 | **Ratified**: 2026-03-07 | **Last Amended**: 2026-03-07
