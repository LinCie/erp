"use client";

import {
  useState,
  useImperativeHandle,
  type ReactNode,
} from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { Plus, Trash2, Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
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
import { Switch } from "@/shared/presentation/components/ui/switch";
import { Label } from "@/shared/presentation/components/ui/label";
import { ImageGalleryUploader } from "@/shared/presentation/components/ui/image-gallery-uploader";
import {
  type ProductFormValues,
  productSlugSchema,
} from "../schemas/create-product-schema";
import { generateSlug } from "../utils/product.utils";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSlugQuery } from "../hooks/use-check-slug-query";
import { useImageCleanup } from "@/shared/presentation/hooks/use-image-cleanup";
import {
  VariantFormFields,
  type VariantFieldValues,
} from "@/modules/variants/presentation/components/variant-form-fields";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

export type ProductFormRef = {
  cleanupUnsavedImages: () => Promise<ProductImage[]>;
};

export type ProductWithVariantsFormValues = ProductFormValues & {
  variants: VariantFieldValues[];
  images: ProductImage[];
};

type ProductFormProps = {
  onSubmit: (value: ProductWithVariantsFormValues) => Promise<void>;
  isPending?: boolean;
  submitLabel?: ReactNode;
  ref?: React.RefObject<ProductFormRef | null>;
};

const DEFAULT_VARIANT: VariantFieldValues = {
  name: "",
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
  ref,
}: ProductFormProps) {
  const [showVariants, setShowVariants] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      images: [] as ProductImage[],
      variants: [] as VariantFieldValues[],
    } as ProductWithVariantsFormValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const { cleanupImages } = useImageCleanup();

  useImperativeHandle(
    ref,
    () => ({
      cleanupUnsavedImages: async () => {
        const currentImages =
          (form.getFieldValue("images") as ProductImage[] | undefined) ?? [];
        await cleanupImages(currentImages);
        return currentImages;
      },
    }),
    [form, cleanupImages],
  );

  const rawSlug = useStore(form.store, (state) => state.values.slug);
  const debouncedSlug = useDebouncedValue(rawSlug, 500);

  const slugCheck = useCheckSlugQuery({
    slug: debouncedSlug,
    enabled: debouncedSlug.length >= 3,
  });

  const slugIsChecking =
    rawSlug !== debouncedSlug || (slugCheck.isFetching && !slugCheck.isError);
  const slugTaken =
    !slugIsChecking && slugCheck.data !== undefined && !slugCheck.data.available;

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
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    placeholder="premium-laptop"
                    disabled={isPending}
                    className={
                      slugTaken
                        ? "border-destructive pr-8 focus-visible:ring-destructive"
                        : slugCheck.data?.available
                          ? "border-green-500 pr-8 focus-visible:ring-green-500"
                          : "pr-8"
                    }
                  />
                  {field.state.value.length >= 3 && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {slugIsChecking ? (
                        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                      ) : slugTaken ? (
                        <XCircleIcon className="size-4 text-destructive" />
                      ) : slugCheck.data?.available ? (
                        <CheckCircle2Icon className="size-4 text-green-500" />
                      ) : null}
                    </span>
                  )}
                </div>
                <FieldError errors={field.state.meta.errors} />
                {slugTaken && !field.state.meta.errors.length && (
                  <p className="text-sm font-medium text-destructive">
                    This slug is already in use by another product.
                  </p>
                )}
                {slugIsChecking && field.state.value.length >= 3 && (
                  <p className="text-xs text-muted-foreground">
                    Checking availability…
                  </p>
                )}
                {!slugIsChecking &&
                  slugCheck.data?.available &&
                  field.state.value.length >= 3 && (
                    <p className="text-xs text-green-600">Slug is available.</p>
                  )}
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

      {/* Images Section */}
      <FieldSet>
        <FieldLegend>Images</FieldLegend>
        <form.Field name="images">
          {(field) => (
            <ImageGalleryUploader
              module="products"
              images={field.state.value}
              onChange={(images) => field.handleChange(images)}
              disabled={isPending}
              maxFiles={10}
            />
          )}
        </form.Field>
      </FieldSet>

      {/* Variants Section */}
      <FieldSet>
        <div className="flex items-center justify-between">
          <FieldLegend>Variants</FieldLegend>
          <div className="flex items-center gap-2">
            <Switch
              id="custom-variants-toggle"
              checked={showVariants}
              onCheckedChange={(checked) => {
                setShowVariants(checked);
                if (!checked) {
                  form.setFieldValue("variants", []);
                }
              }}
              disabled={isPending}
            />
            <Label htmlFor="custom-variants-toggle" className="text-sm">
              Add custom variants
            </Label>
          </div>
        </div>

        {!showVariants ? (
          <p className="text-sm text-muted-foreground">
            A default variant will be generated automatically with an
            auto-generated SKU and $0.00 price.
          </p>
        ) : (
          <form.Field name="variants" mode="array">
            {(field) => {
              const variantsValue = field.state.value as VariantFieldValues[];

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-end">
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
                      No variants added yet. Click &quot;Add Variant&quot; to
                      get started, or toggle off to auto-generate a default.
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
                </div>
              );
            }}
          </form.Field>
        )}
      </FieldSet>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || slugTaken || slugIsChecking}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
