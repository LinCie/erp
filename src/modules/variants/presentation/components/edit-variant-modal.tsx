"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/presentation/components/ui/dialog";
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
import { Label } from "@/shared/presentation/components/ui/label";
import { ImageGalleryUploader } from "@/shared/presentation/components/ui/image-gallery-uploader";
import { PencilIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useUpdateVariantMutation } from "../hooks/use-update-variant-mutation";
import type { VariantEntity } from "../../domain/variant.entity";
import { updateVariantSchema } from "../schemas/variant-schema";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSkuQuery } from "../hooks/use-check-sku-query";
import { useImageCleanup } from "@/shared/presentation/hooks/use-image-cleanup";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type EditVariantModalProps = {
  productId: string;
  variant: VariantEntity;
};

export function EditVariantModal({ productId, variant }: EditVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateMutation = useUpdateVariantMutation(productId);
  const { cleanupNewImages } = useImageCleanup();

  const form = useForm({
    defaultValues: {
      name: variant.name,
      sku: variant.sku,
      basePrice: variant.basePrice,
      salePrice: variant.salePrice ?? undefined,
      costPrice: variant.costPrice ?? undefined,
      currency: variant.currency,
      isDefault: variant.isDefault,
      images: variant.images as ProductImage[],
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          variantId: variant.id,
          input: {
            name: value.name,
            sku: value.sku,
            basePrice: value.basePrice,
            salePrice: value.salePrice,
            costPrice: value.costPrice,
            currency: value.currency,
            isDefault: value.isDefault,
            images: value.images,
          },
        });
        setIsOpen(false);
      } catch {
      }
    },
  });

  // Subscribe to the raw SKU value from the form store, then debounce 500ms
  const rawSku = useStore(form.store, (state) => state.values.sku);
  const debouncedSku = useDebouncedValue(rawSku, 500);

  // Exclude the current variant from the uniqueness check (editing its own SKU is fine)
  const skuCheck = useCheckSkuQuery({
    sku: debouncedSku,
    excludeId: variant.id,
    productId,
    enabled:
      isOpen &&
      (debouncedSku ?? "").length >= 3 &&
      debouncedSku !== variant.sku,
  });

  // While the user is still typing (raw differs from debounced), show checking state
  const skuIsChecking =
    rawSku !== debouncedSku || (skuCheck.isFetching && !skuCheck.isError);

  // SKU is the same as the original — always valid (no need to check)
  const skuUnchanged = rawSku === variant.sku;
  const skuTaken =
    !skuUnchanged &&
    !skuIsChecking &&
    skuCheck.data !== undefined &&
    !skuCheck.data.available;

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      const currentImages = (form.getFieldValue("images") ?? []) as ProductImage[];
      const originalKeys = new Set(variant.images.map((img) => img.key));
      await cleanupNewImages(currentImages, originalKeys);
      form.reset();
    }
    setIsOpen(nextOpen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <PencilIcon className="size-4" />
          <span className="sr-only">Edit variant</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Variant</DialogTitle>
          <DialogDescription>
            Update the details for this variant.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4 py-4">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = updateVariantSchema.shape.name?.safeParse(value);
                  if (!result) return undefined;
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="name">Name *</FieldLabel>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Small / Red"
                    disabled={updateMutation.isPending}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="sku"
              validators={{
                onChange: ({ value }) => {
                  const result = updateVariantSchema.shape.sku?.safeParse(value);
                  if (!result) return undefined;
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="sku">SKU *</FieldLabel>
                  <div className="relative">
                    <Input
                      id="sku"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="PROD-001"
                      disabled={updateMutation.isPending}
                      className={
                        skuTaken
                          ? "border-destructive pr-8 focus-visible:ring-destructive"
                          : !skuUnchanged && skuCheck.data?.available
                            ? "border-green-500 pr-8 focus-visible:ring-green-500"
                            : "pr-8"
                      }
                    />
                    {/* SKU availability indicator — only show when SKU has changed */}
                    {!skuUnchanged && (field.state.value ?? "").length >= 3 && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {skuIsChecking ? (
                          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                        ) : skuTaken ? (
                          <XCircleIcon className="size-4 text-destructive" />
                        ) : skuCheck.data?.available ? (
                          <CheckCircle2Icon className="size-4 text-green-500" />
                        ) : null}
                      </span>
                    )}
                  </div>
                  {/* Zod format errors */}
                  <FieldError errors={field.state.meta.errors} />
                  {/* Uniqueness conflict error */}
                  {skuTaken && !field.state.meta.errors.length && (
                    <p className="text-sm font-medium text-destructive">
                      This SKU is already in use by another variant.
                    </p>
                  )}
                  {/* Checking hint */}
                  {!skuUnchanged &&
                    skuIsChecking &&
                    (field.state.value ?? "").length >= 3 && (
                      <p className="text-xs text-muted-foreground">
                        Checking availability…
                      </p>
                    )}
                  {/* Available confirmation */}
                  {!skuUnchanged &&
                    !skuIsChecking &&
                    skuCheck.data?.available &&
                    (field.state.value ?? "").length >= 3 && (
                      <p className="text-xs text-green-600">SKU is available.</p>
                    )}
                </Field>
              )}
            </form.Field>

            <form.Field name="basePrice">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="basePrice">Base Price *</FieldLabel>
                  <Input
                    id="basePrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.handleChange(0);
                      } else {
                        const num = parseFloat(val);
                        field.handleChange(isNaN(num) ? 0 : num);
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder="0.00"
                    disabled={updateMutation.isPending}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="salePrice">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="salePrice">Sale Price</FieldLabel>
                  <Input
                    id="salePrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.handleChange(undefined);
                      } else {
                        const num = parseFloat(val);
                        field.handleChange(isNaN(num) ? undefined : num);
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder="0.00 (optional)"
                    disabled={updateMutation.isPending}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="costPrice">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="costPrice">Cost Price</FieldLabel>
                  <Input
                    id="costPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.handleChange(undefined);
                      } else {
                        const num = parseFloat(val);
                        field.handleChange(isNaN(num) ? undefined : num);
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder="0.00 (optional)"
                    disabled={updateMutation.isPending}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="isDefault">
              {(field) => (
                <div className="flex items-center gap-2">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    disabled={updateMutation.isPending}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="isDefault">Default variant</Label>
                </div>
              )}
            </form.Field>
          </FieldGroup>

          <FieldSet>
            <FieldLegend>Images</FieldLegend>
            <form.Field name="images">
              {(field) => (
                <ImageGalleryUploader
                  module="products"
                  images={field.state.value ?? []}
                  onChange={(images) => field.handleChange(images)}
                  disabled={updateMutation.isPending}
                  maxFiles={10}
                />
              )}
            </form.Field>
          </FieldSet>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || skuTaken || (!skuUnchanged && skuIsChecking)}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
