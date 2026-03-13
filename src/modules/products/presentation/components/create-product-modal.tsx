"use client";

import { useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/presentation/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a product to the active organization. Optionally add variants
            now or manage them later from the product detail page.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
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
      </DialogContent>
    </Dialog>
  );
}
