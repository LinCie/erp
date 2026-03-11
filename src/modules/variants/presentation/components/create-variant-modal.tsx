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
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { PlusIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useCreateVariantMutation } from "../hooks/use-create-variant-mutation";
import { createVariantSchema } from "../schemas/variant-schema";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSkuQuery } from "../hooks/use-check-sku-query";

type CreateVariantModalProps = {
  productId: string;
};

export function CreateVariantModal({ productId }: CreateVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = useCreateVariantMutation(productId);

  const form = useForm({
    defaultValues: {
      name: "",
      sku: "",
      basePrice: 0,
      salePrice: undefined as number | undefined,
      costPrice: undefined as number | undefined,
      currency: "USD",
      isDefault: false,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          name: value.name,
          sku: value.sku,
          basePrice: value.basePrice,
          salePrice: value.salePrice,
          costPrice: value.costPrice,
          currency: value.currency,
          isDefault: value.isDefault,
        });
        setIsOpen(false);
        form.reset();
      } catch {
        // Error is handled by mutation's onError handler
      }
    },
  });

  // Subscribe to the raw SKU value from the form store, then debounce 500ms
  const rawSku = useStore(form.store, (state) => state.values.sku);
  const debouncedSku = useDebouncedValue(rawSku, 500);

  const skuCheck = useCheckSkuQuery({
    sku: debouncedSku,
    productId,
    // Don't fire if the SKU hasn't settled or is below min length
    enabled: isOpen && debouncedSku.length >= 3,
  });

  const skuIsChecking =
    rawSku !== debouncedSku || (skuCheck.isFetching && !skuCheck.isError);
  const skuTaken =
    !skuIsChecking && skuCheck.data !== undefined && !skuCheck.data.available;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="size-4" />
          Add Variant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Variant</DialogTitle>
          <DialogDescription>
            Create a new variant for this product with a unique SKU.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = createVariantSchema.shape.name.safeParse(value);
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
                    disabled={createMutation.isPending}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="sku"
              validators={{
                onChange: ({ value }) => {
                  const result = createVariantSchema.shape.sku.safeParse(value);
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
                      disabled={createMutation.isPending}
                      className={
                        skuTaken
                          ? "border-destructive pr-8 focus-visible:ring-destructive"
                          : skuCheck.data?.available
                            ? "border-green-500 pr-8 focus-visible:ring-green-500"
                            : "pr-8"
                      }
                    />
                    {/* SKU availability indicator */}
                    {field.state.value.length >= 3 && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                  {/* SKU format errors from Zod */}
                  <FieldError errors={field.state.meta.errors} />
                  {/* SKU uniqueness error */}
                  {skuTaken && !field.state.meta.errors.length && (
                    <p className="text-sm font-medium text-destructive">
                      This SKU is already in use by another variant.
                    </p>
                  )}
                  {/* Checking hint */}
                  {skuIsChecking && field.state.value.length >= 3 && (
                    <p className="text-xs text-muted-foreground">
                      Checking availability…
                    </p>
                  )}
                  {/* Available confirmation */}
                  {!skuIsChecking &&
                    skuCheck.data?.available &&
                    field.state.value.length >= 3 && (
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="isDefault">Default variant</Label>
                </div>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || skuTaken || skuIsChecking}
            >
              {createMutation.isPending ? "Creating..." : "Create Variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
