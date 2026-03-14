# erp Development Guidelines

## Active Technologies

- TypeScript 5.x with strict mode + Elysia 1.4+, Next.js 16+, React 19+, Kysely ORM, TanStack Form/Query

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

## Code Style

### TypeScript

- **Strict mode enabled** - No `any` types without explicit justification
- Use `type` over `interface` for simple type definitions
- Explicit return types on all exported functions
- Use `readonly` arrays and objects where mutation is not expected

### Naming Conventions

- **Files**: kebab-case (e.g., `product-list-view.tsx`, `use-products-query.ts`)
- **Components**: PascalCase (e.g., `ProductListView`, `CreateProductModal`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProductQuery`, `useDebouncedValue`)
- **Types/Interfaces**: PascalCase (e.g., `ProductEntity`, `CreateProductInput`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `PRODUCT_SORT_FIELDS`)
- **Classes**: PascalCase (e.g., `ProductService`, `ProductRepositoryImpl`)
- **Query Keys**: camelCase object factories (e.g., `productKeys`, `userKeys`)

## Recent Changes

- 001-product-variants: Added TypeScript 5.x with strict mode + Elysia 1.4+, Next.js 16+, React 19+, Kysely ORM, TanStack Form/Query

## Error Resolution Protocol

When encountering an error (build failure, type error, runtime error, test failure, etc.), the agent MUST:

1. **Search for solutions** using web search (`exa_web_search_exa`) and/or Context7 (`context7_resolve-library-id` + `context7_query-docs`) before attempting fixes
2. **Prioritize Context7** for library/framework-specific errors (Elysia, Next.js, React, TanStack, Kysely, etc.)
3. **Use web search** for general errors, version-specific issues, or when Context7 doesn't yield results
4. **Document the solution** - briefly note what fixed the issue for future reference

This ensures solutions are based on current best practices and documented patterns rather than assumptions.

## Design Context

### Users
Mixed audience of internal employees and B2B customers. Users range from operations staff managing inventory and orders to business clients accessing their account data. They need to accomplish tasks efficiently without feeling overwhelmed by complexity.

### Brand Personality
**Friendly, Approachable, Smart**

The interface should feel welcoming and unintimidating while conveying competence. Users should feel the system is on their side—helping them work smarter, not harder. Avoid enterprise software sterility; embrace warmth without sacrificing professionalism.

### Aesthetic Direction
**Calm & Focused**

- **Visual tone**: Clean, spacious, distraction-free. Think Notion's serene workspaces and Slack's friendly productivity.
- **References**: Notion (minimal, calm, content-focused), Slack (approachable, efficient, delightful micro-interactions)
- **Anti-references**: Avoid Salesforce/SAP density, avoid aggressive gradients or flashy animations
- **Theme**: Support both light and dark mode. Light mode should feel airy and open; dark mode should reduce eye strain during extended use.

### Design Principles

1. **Clarity over density** — Prioritize whitespace and visual hierarchy. Don't cram information; guide the eye naturally.

2. **Friendly but not playful** — Warm colors and approachable typography, but never childish. Smart defaults, helpful guidance.

3. **Efficiency through simplicity** — Reduce clicks, not features. Surface the most common actions, hide complexity until needed.

4. **Consistent patterns** — Reuse components and layouts. Users should learn once, apply everywhere.

5. **Accessible by default** — WCAG 2.1 AA compliance. Clear labels, sufficient contrast, keyboard navigation, reduced motion support.

### Color System
- **Primary**: Purple/violet (oklch(0.457 0.24 277.023)) — conveys intelligence and creativity
- **Base**: Mauve neutral tones — warm grays that feel approachable, not cold
- **Semantic**: Green for success, red for destructive actions, maintained across themes

### Typography
- **Primary**: Roboto — friendly, readable, universally available
- **Accent**: Geist Sans/Mono — modern, clean for technical content

### Spacing & Radius
- **Radius**: Subtle rounding (0.1rem base) — soft but not bubbly
- **Spacing**: Generous whitespace, consistent 4px grid system

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.