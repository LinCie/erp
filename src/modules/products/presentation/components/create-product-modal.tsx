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
  ProductForm,
  type ProductFormRef,
  type ProductWithVariantsFormValues,
} from "./product-form";
import { useCreateProductWithVariants } from "../hooks/use-create-product-with-variants";

export function CreateProductModal() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createMutation = useCreateProductWithVariants();
  const productFormRef = useRef<ProductFormRef | null>(null);

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      await productFormRef.current?.cleanupUnsavedImages();
      setSubmitError(null);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (value: ProductWithVariantsFormValues) => {
    setSubmitError(null);
    try {
      await createMutation.mutateAsync({
        name: value.name,
        slug: value.slug,
        description: value.description,
        status: value.status,
        images: value.images,
        variants: value.variants.length > 0 ? value.variants : undefined,
      });
      setOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not create product. Please try again.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create Product
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Product</SheetTitle>
          <SheetDescription>
            Add a new product. Variants can be added now or later.
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

        <ProductForm
          ref={productFormRef}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          submitLabel={
            createMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Creating…
              </>
            ) : (
              "Create Product"
            )
          }
        />
      </SheetContent>
    </Sheet>
  );
}
