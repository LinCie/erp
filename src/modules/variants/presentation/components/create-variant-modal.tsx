"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
import { PlusIcon } from "lucide-react";
import { useCreateVariantMutation } from "../hooks/use-create-variant-mutation";
import { createVariantSchema } from "../schemas/variant-schema";

type CreateVariantModalProps = {
  productId: string;
};

export function CreateVariantModal({ productId }: CreateVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = useCreateVariantMutation(productId);

  const form = useForm({
    defaultValues: {
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
                  <Input
                    id="sku"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="PROD-001"
                    disabled={createMutation.isPending}
                  />
                  <FieldError errors={field.state.meta.errors} />
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
