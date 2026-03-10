# Tasks: Product Variants Module

**Input**: Design documents from `/specs/001-product-variants/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/api-contract.md

**Tests**: NOT included (tests are optional per specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create variants module directory structure in src/modules/variants/
- [x] T002 Configure Elysia backend dependencies for variants module
- [x] T003 [P] Configure frontend TanStack Form and Query dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [x] T004 Create Kysely migration add_variants_table.ts using bun db:migrate:create
- [x] T005 Run migration and generate types with bun run db:codegen

### Domain Layer (Shared Types)

- [x] T006 [P] Create Variant domain entity in src/modules/variants/domain/variant.entity.ts
- [x] T007 [P] Create Variant application types in src/modules/variants/application/types/variant.types.ts

### Shared Schemas

- [x] T008 [P] Create Zod schemas in src/modules/variants/presentation/schemas/variant-schema.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Product with Multiple Variants (Priority: P1) 🎯 MVP

**Goal**: Enable users to create a new product with multiple variants, each having unique SKUs and prices, all within a single form submission.

**Independent Test**: Create a product with 2-3 variants (e.g., SKU "PROD-A-001" price $50, SKU "PROD-A-002" price $45, SKU "PROD-A-003" price $55). Verify all variants are saved, linked to the product, and each has a unique SKU.

### Backend Implementation

- [x] T009 Create Variant repository interface in src/modules/variants/application/variant.repository.ts
- [x] T010 Implement Variant repository in src/modules/variants/infrastructure/variant.repository.impl.ts (depends on T009)
- [x] T011 Implement Variant service in src/modules/variants/application/variant.service.ts with bulkCreate method (depends on T010)
- [x] T012 Create Variant API routes in src/modules/variants/presentation/variant.routes.ts with POST /products/:productId/variants and POST /products/:productId/variants/bulk endpoints (depends on T011)

### Frontend Components

- [x] T013 [P] Create variant form fields component in src/modules/variants/presentation/components/variant-form-fields.tsx
- [x] T014 [P] Create variant list view component in src/modules/variants/presentation/components/variant-list-view.tsx
- [x] T015 Update product form to include variants array field in src/modules/products/presentation/components/product-form.tsx using TanStack Form mode="array" (depends on T013)
- [x] T016 Update product creation page to handle variants submission in src/modules/products/presentation/hooks/use-create-product-with-variants.ts (depends on T015)

### Query Hooks

- [x] T017 [P] Create variant query key factory in src/modules/variants/presentation/hooks/variant-keys.ts
- [x] T018 [P] Create use-variants-query hook in src/modules/variants/presentation/hooks/use-variants-query.ts (depends on T017)
- [x] T019 [P] Create use-create-variant-mutation hook in src/modules/variants/presentation/hooks/use-create-variant-mutation.ts

**Checkpoint**: User Story 1 complete - Users can create products with multiple variants in a single form

---

## Phase 4: User Story 2 - Create Product with Auto-Generated Default Variant (Priority: P1)

**Goal**: Automatically create a default variant when users don't provide variant details during product creation, ensuring every product has at least one variant.

**Independent Test**: Create a product without entering any variant information. Verify the product is created with a default variant having an auto-generated SKU (pattern: "AUTO-{productId}-{timestamp}") and default price ($0.00).

### Backend Implementation

- [x] T020 Add createDefaultVariant method to Variant service in src/modules/variants/application/variant.service.ts (depends on T011)
- [x] T021 Update product creation workflow to call default variant generation in src/modules/products/application/product.service.ts (depends on T020)

### Frontend Components

- [x] T022 Update product form to conditionally show variants section based on user choice in src/modules/products/presentation/components/product-form.tsx (depends on T015)
- [x] T023 Add default variant display in product detail view in src/modules/products/presentation/components/product-detail-view.tsx

**Checkpoint**: User Story 2 complete - Products without variant data automatically get a default variant

---

## Phase 5: User Story 3 - Manage Variants on Product Detail Page (Priority: P2)

**Goal**: Allow users to view, edit, add, and delete variants directly from the product detail page without navigating away.

**Independent Test**: Navigate to an existing product with variants, add a new variant, edit an existing variant's price, and delete a variant. Verify all changes persist and are immediately visible.

### Backend Implementation

- [ ] T024 Add updateVariant method to Variant service in src/modules/variants/application/variant.service.ts (depends on T011)
- [ ] T025 Add deleteVariant method to Variant service in src/modules/variants/application/variant.service.ts (depends on T011)
- [ ] T026 Update Variant API routes with PUT and DELETE endpoints in src/modules/variants/presentation/variant.routes.ts (depends on T024, T025)

### Frontend Components

- [ ] T027 [P] Create create-variant-modal component in src/modules/variants/presentation/components/create-variant-modal.tsx
- [ ] T028 [P] Create edit-variant-modal component in src/modules/variants/presentation/components/edit-variant-modal.tsx
- [ ] T029 [P] Create delete-variant-alert component in src/modules/variants/presentation/components/delete-variant-alert.tsx
- [ ] T030 Update product detail view with variants table and action buttons in src/modules/products/presentation/components/product-detail-view.tsx (depends on T027, T028, T029, T014)

### Query Hooks

- [ ] T031 [P] Create use-update-variant-mutation hook in src/modules/variants/presentation/hooks/use-update-variant-mutation.ts
- [ ] T032 [P] Create use-delete-variant-mutation hook in src/modules/variants/presentation/hooks/use-delete-variant-mutation.ts

**Checkpoint**: User Story 3 complete - Users can manage variants from product detail page

---

## Phase 6: User Story 4 - Ensure SKU Uniqueness Across All Variants (Priority: P2)

**Goal**: Enforce SKU uniqueness across all variants in the catalog to maintain inventory tracking accuracy.

**Independent Test**: Attempt to create a variant with SKU "EXISTING-001" that already exists. Verify the system prevents the creation and displays a clear error message indicating the SKU is already in use.

### Backend Implementation

- [ ] T033 Add SKU availability check method to Variant repository in src/modules/variants/infrastructure/variant.repository.impl.ts (depends on T010)
- [ ] T034 Add SKU validation to create and update methods in Variant service in src/modules/variants/application/variant.service.ts (depends on T033)
- [ ] T035 Add check-sku endpoint to Variant API routes in src/modules/variants/presentation/variant.routes.ts (depends on T034)

### Frontend Implementation

- [ ] T036 Add SKU availability check with debouncing (500ms) in variant form fields in src/modules/variants/presentation/components/variant-form-fields.tsx
- [ ] T037 Display SKU conflict errors with clear messaging in variant form components

**Checkpoint**: User Story 4 complete - SKU uniqueness enforced across all variants

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Data Integrity

- [ ] T038 [P] Create post-migration script to generate default variants for existing products without variants
- [ ] T039 Add SKU normalization (trim whitespace) in Zod schema transforms in src/modules/variants/presentation/schemas/variant-schema.ts

### UI Polish

- [ ] T040 [P] Add loading skeletons for variants list in src/modules/variants/presentation/components/variant-list-view.tsx
- [ ] T041 [P] Add error handling for all variant operations with user-friendly messages
- [ ] T042 Add optimistic updates for variant CRUD operations in query hooks

### Documentation

- [ ] T043 Update API documentation with variant endpoints
- [ ] T044 Add inline code comments for complex variant logic

### Validation

- [ ] T045 Run quickstart.md validation steps
- [ ] T046 Verify all TypeScript strict mode compliance
- [ ] T047 Run lint and typecheck: bun run lint

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 stories)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Builds on US1 variant creation
- **User Story 3 (P2)**: Can start after Foundational - Extends US1 with edit/delete
- **User Story 4 (P2)**: Can start after Foundational - Enhances all stories with SKU validation

**Note**: US1 and US2 can be worked on in parallel after Foundational phase. US3 and US4 can be worked on in parallel after US1 is complete.

### Within Each User Story

- Domain types before repository interface
- Repository interface before repository implementation
- Repository implementation before service
- Service before API routes
- API routes before frontend hooks
- Hooks before UI components
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - Developer A: User Story 1 (backend focus)
  - Developer B: User Story 1 (frontend focus)
  - Developer C: User Story 2 (parallel to US1)
- After US1/US2 complete:
  - Developer A: User Story 3
  - Developer B: User Story 4
- Models and schemas within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend implementation in parallel:
Task: "Create Variant repository interface in src/modules/variants/application/variant.repository.ts"
Task: "Create Variant domain entity in src/modules/variants/domain/variant.entity.ts"
Task: "Create Zod schemas in src/modules/variants/presentation/schemas/variant-schema.ts"

# Then service and routes:
Task: "Implement Variant repository in src/modules/variants/infrastructure/variant.repository.impl.ts"
Task: "Implement Variant service in src/modules/variants/application/variant.service.ts"
Task: "Create Variant API routes in src/modules/variants/presentation/variant.routes.ts"

# Launch frontend implementation in parallel:
Task: "Create variant form fields component in src/modules/variants/presentation/components/variant-form-fields.tsx"
Task: "Create variant list view component in src/modules/variants/presentation/components/variant-list-view.tsx"
Task: "Create variant query key factory in src/modules/variants/presentation/hooks/variant-keys.ts"

# Then integrate:
Task: "Update product form to include variants array field"
Task: "Update product creation page to handle variants submission"
```

---

## Implementation Strategy

### MVP First (User Story 1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Create Product with Multiple Variants
4. Complete Phase 4: User Story 2 - Auto-Generated Default Variant
5. **STOP and VALIDATE**: Test core variant creation flows
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP Core!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP Complete!)
4. Add User Story 3 → Test independently → Deploy/Demo (Management)
5. Add User Story 4 → Test independently → Deploy/Demo (Data Integrity)
6. Add Phase 7 Polish → Final validation → Deploy
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Backend + Frontend core)
   - Developer B: User Story 2 (Default variant logic)
3. After US1/US2 complete:
   - Developer A: User Story 3 (Management UI)
   - Developer B: User Story 4 (SKU validation)
4. Stories complete and integrate independently
5. Phase 7 polish done collaboratively

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths follow ERP Constitution module structure
- TypeScript strict mode compliance required for all new code
- Tests are optional per specification - add only if explicitly requested later

---

## Summary

**Total Tasks**: 47

**Task Count by User Story**:

- Setup (Phase 1): 3 tasks
- Foundational (Phase 2): 5 tasks
- User Story 1 (P1): 11 tasks
- User Story 2 (P1): 4 tasks
- User Story 3 (P2): 8 tasks
- User Story 4 (P2): 5 tasks
- Polish (Phase 7): 11 tasks

**Parallel Opportunities**:

- 3 Setup tasks can run in parallel
- 5 Foundational tasks can run in parallel
- Multiple developers can work on US1/US2 simultaneously after Foundational
- UI components and query hooks can be developed in parallel

**MVP Scope**: User Stories 1 and 2 (P1 priority) - enables core variant creation with default generation

**All tasks follow checklist format**: ✅ Validated (checkbox, ID, optional [P], optional [Story], file path)
