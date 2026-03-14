"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/presentation/components/ui/sheet";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  VariantForm,
  type VariantFormRef,
  type VariantFormValues,
} from "./variant-form";
import { useUpdateVariantMutation } from "../hooks/use-update-variant-mutation";
import type { VariantEntity } from "../../domain/variant.entity";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type EditVariantModalProps = {
  productId: string;
  variant: VariantEntity;
  children?: React.ReactNode;
};

export function EditVariantModal({
  productId,
  variant,
  children,
}: EditVariantModalProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateMutation = useUpdateVariantMutation(productId);
  const variantFormRef = useRef<VariantFormRef | null>(null);

  const originalKeys = new Set(variant.images.map((img) => img.key));

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      await variantFormRef.current?.cleanupUnsavedImages(originalKeys);
      variantFormRef.current?.reset();
      setSubmitError(null);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (value: VariantFormValues) => {
    setSubmitError(null);
    try {
      await updateMutation.mutateAsync({
        variantId: variant.id,
        input: {
          name: value.name,
          sku: value.sku,
          status: value.status,
          basePrice: value.basePrice,
          salePrice: value.salePrice,
          costPrice: value.costPrice,
          currency: value.currency,
          isDefault: value.isDefault,
          images: value.images,
        },
      });
      setOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not update variant. Please try again.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Pencil className="size-4" aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Variant</SheetTitle>
          <SheetDescription>
            Update the details for this variant.
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
          isPending={updateMutation.isPending}
          submitLabel={
            updateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )
          }
          initialValues={{
            name: variant.name,
            sku: variant.sku,
            status: variant.status,
            basePrice: variant.basePrice,
            salePrice: variant.salePrice ?? undefined,
            costPrice: variant.costPrice ?? undefined,
            currency: variant.currency,
            isDefault: variant.isDefault,
            images: variant.images as ProductImage[],
          }}
          excludeId={variant.id}
        />
      </SheetContent>
    </Sheet>
  );
}
