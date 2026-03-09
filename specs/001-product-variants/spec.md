# Feature Specification: Product Variants Module

**Feature Branch**: `001-product-variants`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "We want to extend our existing products module by adding a variants module, where product variants are separate entities but linked to products. The goal is to allow the user to create product variants directly within the product creation form."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Product with Multiple Variants (Priority: P1)

As a product manager, I want to create a new product and define multiple variants with unique SKUs and prices in a single form, so that I can quickly set up products with different pricing options (e.g., bulk pricing tiers, regional pricing).

**Why this priority**: This is the core value proposition of the feature - enabling products to have pricing differentiation through variants. Without this, the product catalog would be limited to single-SKU products, forcing workarounds like creating duplicate products with different prices.

**Independent Test**: Can be fully tested by creating a product with 2-3 variants, each having unique SKUs and prices. The product appears in the catalog with all variants accessible from the product detail page. Users can select different variants during ordering/invoicing.

**Acceptance Scenarios**:

1. **Given** I am on the product creation form, **When** I enter SKU "PROD-A-001", price $50.00, SKU "PROD-A-002", price $45.00 (bulk tier), and SKU "PROD-A-003", price $55.00 (premium), **Then** all three variants are saved and linked to the product, and each has a unique SKU across the system.

2. **Given** I am creating a product and provide only one variant with SKU "SINGLE-001" and price $100.00, **When** I submit the form, **Then** exactly one variant is created with those values and linked to the product.

3. **Given** I attempt to create a product with variants where two variants have the same SKU "DUPLICATE-001", **When** I submit the form, **Then** the system prevents submission and informs me that SKUs must be unique across all variants in the system.

---

### User Story 2 - Create Product with Auto-Generated Default Variant (Priority: P1)

As a product manager, I want the system to automatically create a default variant when I don't provide variant details, so that every product always has at least one variant without requiring manual data entry for simple products.

**Why this priority**: This ensures backward compatibility and simplicity - users who don't need variant differentiation can create products quickly without learning the variant system. It maintains data consistency by ensuring every product always has at least one variant.

**Independent Test**: Can be fully tested by creating a product without entering any variant details. The product is created successfully with a default variant that has system-generated values and can be viewed/edited later.

**Acceptance Scenarios**:

1. **Given** I am creating a new product and I do not enter any variant information, **When** I submit the product form, **Then** the system automatically creates a default variant with system-generated SKU (e.g., "AUTO-{timestamp}" or similar pattern) and default price ($0.00 or configurable default).

2. **Given** a product exists with only a default variant, **When** I view the product detail page, **Then** I can see the default variant and its details, and I can choose to edit it or add additional variants.

---

### User Story 3 - Manage Variants on Product Detail Page (Priority: P2)

As a product manager, I want to view, edit, add, and delete variants directly from the product detail page, so that I can manage product pricing and SKUs in one centralized location without navigating away.

**Why this priority**: This provides the ongoing management capability for variants. While creating variants during product setup (P1) is critical, being able to modify them afterward ensures the product catalog remains accurate as business needs change.

**Independent Test**: Can be fully tested by navigating to an existing product with variants, viewing the variants list, adding a new variant, editing an existing variant's price, and deleting a variant. All changes persist and are immediately visible.

**Acceptance Scenarios**:

1. **Given** I am viewing a product detail page that has 2 variants, **When** I click "Add Variant" and enter SKU "NEW-001" with price $75.00, **Then** the new variant appears in the variants list with the correct SKU and price.

2. **Given** I am viewing a product with variant "VARIANT-001" priced at $50.00, **When** I edit that variant and change the price to $60.00, **Then** the variant is updated with the new price and the change is reflected immediately in the variants list.

3. **Given** I am viewing a product with 3 variants, **When** I delete one variant, **Then** that variant is removed from the system, the remaining 2 variants are unaffected, and the product continues to function normally.

4. **Given** I attempt to delete the last remaining variant of a product, **When** I confirm the deletion, **Then** the system prevents the deletion or automatically creates a new default variant to ensure the product always has at least one variant.

---

### User Story 4 - Ensure SKU Uniqueness Across All Variants (Priority: P2)

As a system administrator, I want the system to enforce SKU uniqueness across all variants in the catalog, so that inventory tracking, order fulfillment, and reporting remain accurate and unambiguous.

**Why this priority**: SKU uniqueness is fundamental to inventory management. Duplicate SKUs would cause confusion in order processing, inventory counts, and analytics. This requirement protects data integrity.

**Independent Test**: Can be fully tested by attempting to create or update variants with SKUs that already exist in the system. The system prevents duplicates and provides clear error messages.

**Acceptance Scenarios**:

1. **Given** a variant with SKU "EXISTING-001" already exists in the system, **When** I attempt to create a new variant with SKU "EXISTING-001" (either on the same product or a different product), **Then** the system rejects the creation and displays an error message indicating the SKU is already in use.

2. **Given** a variant with SKU "OLD-001" exists on Product A, **When** I edit a variant on Product B and change its SKU to "OLD-001", **Then** the system prevents the update and informs me that the SKU is already assigned to another variant.

---

### Edge Cases

- **What happens when a user tries to create a product with no variants and no default generation?**
  - The system MUST automatically generate a default variant with system-defined values to ensure every product has at least one variant.

- **How does the system handle variant deletion when it's the only variant?**
  - The system MUST either prevent deletion of the last variant OR automatically generate a new default variant before allowing deletion, ensuring products never exist without variants.

- **What happens if two users simultaneously try to create variants with the same SKU?**
  - The system MUST enforce SKU uniqueness at the database level, allowing only one variant to be created with that SKU and rejecting the second attempt with a clear error message.

- **How are pricing-related fields handled if not provided?**
  - For manually entered variants: price defaults to $0.00 or the system-configured default price
  - For auto-generated variants: all pricing fields use system defaults

- **What happens to existing orders/invoices when a variant's price is changed?**
  - Historical orders and invoices retain the price at the time of transaction (immutable historical pricing)
  - Only future transactions use the updated price

- **Can a variant's SKU be changed after creation?**
  - Yes, but the new SKU must still be unique across all variants
  - Changing a SKU should not affect existing orders (which reference the variant ID, not SKU)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create one or more variants during product creation, with each variant specifying at minimum a unique SKU and price.

- **FR-002**: System MUST automatically generate a default variant when the user does not provide variant data during product creation, using system-defined default values for all required fields.

- **FR-003**: System MUST enforce SKU uniqueness across ALL variants in the system, regardless of which product they belong to.

- **FR-004**: System MUST store variants in a separate data structure (table/collection) with each variant referencing exactly one parent product via a product identifier.

- **FR-005**: System MUST display the variants module exclusively on the product detail page, not as a standalone module.

- **FR-006**: Each variant MUST maintain independent pricing fields (base price, sale price, cost price if applicable, currency) that are not shared with other variants of the same product.

- **FR-007**: System MUST support adding new variants to an existing product from the product detail page.

- **FR-008**: System MUST support editing existing variant details (SKU, price fields) from the product detail page.

- **FR-009**: System MUST support deleting variants from the product detail page, with the constraint that a product must always retain at least one variant.

- **FR-010**: System MUST validate that variant SKUs are unique before allowing creation or update operations, providing clear error messages for duplicate SKUs.

### Key Entities *(include if feature involves data)*

- **Product**: The parent entity representing an item in the catalog. Contains only identification and metadata (no pricing or SKU fields - these are delegated to variants). Has a one-to-many relationship with Variants.

- **Variant**: A child entity linked to exactly one Product. Represents a specific sellable version of the product with unique identification and pricing. Key attributes:
  - Unique SKU (system-wide uniqueness)
  - Base price
  - Additional pricing fields as needed (sale price, cost price, currency)
  - Reference to parent Product
  - Creation and modification timestamps
  - Soft delete support (for audit and recovery)

- **Variant Creation Context**: The form/interface where variants are created, supporting:
  - Multiple variant entries in a single submission
  - Validation of SKU uniqueness in real-time or on submission
  - Default value population when fields are left empty

## Assumptions

- **Assumption 1**: The existing products module has a unique identifier system that can be referenced by variants (productId).

- **Assumption 2**: SKU format is flexible (alphanumeric with common separators like hyphens) and no specific format validation is required beyond uniqueness and reasonable length limits (e.g., 3-50 characters).

- **Assumption 3**: Currency handling is consistent with the existing product/pricing system - variants use the same currency representation as the rest of the application.

- **Assumption 4**: Historical pricing is preserved through order/invoice records that snapshot prices at transaction time, so variant price changes do not affect past transactions.

- **Assumption 5**: The system supports soft deletes for audit purposes, and deleted variants can be recovered if needed within a reasonable timeframe.

- **Assumption 6**: Default variant generation uses a deterministic or timestamp-based pattern for SKU generation (e.g., "AUTO-{timestamp}" or "DEFAULT-{product-id}") to minimize collision risk.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a product with 3 variants in under 2 minutes, including entering unique SKUs and prices for each variant.

- **SC-002**: 100% of products created without variant data automatically generate a valid default variant with unique SKU and default pricing.

- **SC-003**: Zero duplicate SKU violations occur in production - the system enforces uniqueness 100% of the time for all variant creation and update operations.

- **SC-004**: Users can add, edit, or delete variants from the product detail page with all changes persisting correctly and immediately visible without page refresh.

- **SC-005**: System maintains referential integrity - deleting a product cascades appropriately to its variants (either soft delete or hard delete based on system policy), and variant operations never orphan data.

- **SC-006**: 95% of users can complete variant management tasks (add/edit/delete) on the first attempt without requiring support or documentation.

- **SC-007**: Variant pricing changes apply only to future transactions; historical orders and invoices retain original pricing, ensuring accurate financial records.

- **SC-008**: System prevents deletion of the last variant of any product, ensuring 100% of products always have at least one variant available.

## Dependencies

- **DEP-001**: Existing products module must have a stable product identification system with unique product IDs.

- **DEP-002**: Product detail page must support extensibility to include the variants module interface.

- **DEP-003**: Existing order/invoice system must handle variant references correctly (if already integrated with products).

## Out of Scope

- Variant attributes beyond SKU and pricing (e.g., color, size, weight, dimensions) are explicitly excluded from this phase.

- Inventory quantity tracking per variant is out of scope for this feature.

- Variant images or media attachments.

- Bulk import/export of variants.

- Variant-level promotions or discount rules (variants support pricing fields but complex pricing rules are out of scope).

- Multi-currency price management beyond storing a currency code with each variant.

## Notes

- The "single form" requirement for product creation with variants suggests a unified interface where product details and variant details are collected together, even though they are stored in separate data structures.

- SKU uniqueness enforcement should consider both case-sensitivity requirements and whitespace normalization (e.g., "SKU-001" vs "sku-001" vs "SKU-001 ").

- Future considerations: This architecture supports future expansion to include variant attributes (color, size) without structural changes, as those would simply be additional fields on the variant entity.

- Default variant values should be configurable at the organization/tenant level if the system supports multi-tenancy.

- Consider implementing SKU format validation in a future iteration to ensure consistency (e.g., all SKUs must follow pattern: 3 letters + 3 numbers).
