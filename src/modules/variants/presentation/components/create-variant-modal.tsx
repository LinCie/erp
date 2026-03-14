"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/presentation/components/ui/sheet";
import {
  VariantForm,
  type VariantFormRef,
  type VariantFormValues,
} from "./variant-form";
import { useCreateVariantMutation } from "../hooks/use-create-variant-mutation";

type CreateVariantModalProps = {
  productId: string;
};

export function CreateVariantModal({ productId }: CreateVariantModalProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createMutation = useCreateVariantMutation(productId);
  const variantFormRef = useRef<VariantFormRef | null>(null);

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      await variantFormRef.current?.cleanupUnsavedImages();
      setSubmitError(null);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (value: VariantFormValues) => {
    setSubmitError(null);
    try {
      await createMutation.mutateAsync({
        name: value.name,
        sku: value.sku,
        status: value.status,
        basePrice: value.basePrice,
        salePrice: value.salePrice,
        costPrice: value.costPrice,
        currency: value.currency,
        isDefault: value.isDefault,
        images: value.images,
      });
      setOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not create variant. Please try again.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add Variant
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Variant</SheetTitle>
          <SheetDescription>
            Create a new variant for this product with a unique SKU.
          </SheetDescription>
        </SheetHeader>

        {submitError ? (
          <div
            className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0 mt-1" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <VariantForm
          ref={variantFormRef}
          productId={productId}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel={
            createMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                Creating…
              </>
            ) : (
              "Create Variant"
            )
          }
        />
      </SheetContent>
    </Sheet>
  );
}
