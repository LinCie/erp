"use client";

import type { ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Textarea } from "@/shared/presentation/components/ui/textarea";
import {
  type ProductFormValues,
  productSlugSchema,
} from "../schemas/create-product-schema";
import { generateSlug, checkSlugAvailability } from "../utils/product.utils";
import {
  VariantFormFields,
  type VariantFieldValues,
} from "@/modules/variants/presentation/components/variant-form-fields";

export type ProductWithVariantsFormValues = ProductFormValues & {
  variants: VariantFieldValues[];
};

type ProductFormProps = {
  onSubmit: (value: ProductWithVariantsFormValues) => Promise<void>;
  isPending?: boolean;
  submitLabel?: ReactNode;
};

const DEFAULT_VARIANT: VariantFieldValues = {
  sku: "",
  basePrice: 0,
  salePrice: undefined,
  costPrice: undefined,
  currency: "USD",
  isDefault: true,
};

export function ProductForm({
  onSubmit,
  isPending,
  submitLabel = "Create",
}: ProductFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      variants: [] as VariantFieldValues[],
    } as ProductWithVariantsFormValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      {/* Product Information */}
      <FieldSet>
        <FieldLegend>Product Details</FieldLegend>
        <FieldGroup>
          <form.Field name="name">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const previousGeneratedSlug = generateSlug(
                      field.state.value,
                    );
                    const currentSlug = form.getFieldValue("slug");

                    field.handleChange(nextValue);

                    if (!currentSlug || currentSlug === previousGeneratedSlug) {
                      form.setFieldValue("slug", generateSlug(nextValue));
                    }
                  }}
                  aria-invalid={field.state.meta.errors.length > 0}
                  placeholder="Premium Laptop"
                  disabled={isPending}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field
            name="slug"
            validators={{
              onChange: ({ value }) => {
                const result = productSlugSchema.safeParse(value.trim());
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value, signal }) => {
                const slug = value.trim();

                if (!productSlugSchema.safeParse(slug).success) {
                  return undefined;
                }

                const isAvailable = await checkSlugAvailability(slug, signal);
                return isAvailable ? undefined : "Slug is already taken";
              },
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  placeholder="premium-laptop"
                  disabled={isPending}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  placeholder="Short description for internal catalog and sales context."
                  disabled={isPending}
                  rows={3}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      {/* Variants Section */}
      <form.Field name="variants" mode="array">
        {(field) => {
          const variantsValue = field.state.value as VariantFieldValues[];

          return (
            <FieldSet>
              <div className="flex items-center justify-between">
                <FieldLegend>
                  Variants{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    (optional)
                  </span>
                </FieldLegend>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    field.pushValue({
                      ...DEFAULT_VARIANT,
                      isDefault: variantsValue.length === 0,
                    })
                  }
                >
                  <Plus data-icon="inline-start" />
                  Add Variant
                </Button>
              </div>

              {variantsValue.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No variants added. A default variant will be generated
                  automatically.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {variantsValue.map((_, index) => (
                    <div key={index} className="relative">
                      <form.Field name={`variants[${index}]`}>
                        {(variantField) => (
                          <VariantFormFields
                            field={variantField}
                            index={index}
                            disabled={isPending}
                          />
                        )}
                      </form.Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={isPending}
                        onClick={() => field.removeValue(index)}
                        aria-label={`Remove variant ${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FieldSet>
          );
        }}
      </form.Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || form.state.isValidating}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
