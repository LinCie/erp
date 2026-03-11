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
import { PencilIcon } from "lucide-react";
import { useUpdateVariantMutation } from "../hooks/use-update-variant-mutation";
import type { VariantEntity } from "../../domain/variant.entity";
import { updateVariantSchema } from "../schemas/variant-schema";

type EditVariantModalProps = {
  productId: string;
  variant: VariantEntity;
};

export function EditVariantModal({ productId, variant }: EditVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateMutation = useUpdateVariantMutation(productId);

  const form = useForm({
    defaultValues: {
      sku: variant.sku,
      basePrice: variant.basePrice,
      salePrice: variant.salePrice ?? undefined,
      costPrice: variant.costPrice ?? undefined,
      currency: variant.currency,
      isDefault: variant.isDefault,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        variantId: variant.id,
        input: {
          sku: value.sku,
          basePrice: value.basePrice,
          salePrice: value.salePrice,
          costPrice: value.costPrice,
          currency: value.currency,
          isDefault: value.isDefault,
        },
      });
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  <Input
                    id="sku"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="PROD-001"
                    disabled={updateMutation.isPending}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
