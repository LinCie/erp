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
import { DropdownMenuItem } from "@/shared/presentation/components/ui/dropdown-menu";
import {
  ProductForm,
  type ProductFormRef,
  type ProductWithVariantsFormValues,
} from "./product-form";
import { useUpdateProductMutation } from "../hooks/use-update-product-mutation";
import type { ProductEntity } from "../../domain/product.entity";
import type { ProductImage } from "../../domain/product-image.entity";

type EditProductModalProps = {
  product: ProductEntity;
  children?: React.ReactNode;
};

export function EditProductModal({ product, children }: EditProductModalProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateProductMutation = useUpdateProductMutation();
  const productFormRef = useRef<ProductFormRef | null>(null);

  const originalKeys = new Set(product.images.map((img) => img.key));

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      await productFormRef.current?.cleanupUnsavedImages(originalKeys);
      productFormRef.current?.reset();
      setSubmitError(null);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (value: ProductWithVariantsFormValues) => {
    setSubmitError(null);
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        name: value.name,
        slug: value.slug,
        description: value.description,
        status: value.status,
        images: value.images,
      });
      setOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not update product. Please try again.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            className="group w-full cursor-pointer font-medium"
          >
            <Pencil className="mr-2 size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            Edit
          </DropdownMenuItem>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>Update product details.</SheetDescription>
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
          isPending={updateProductMutation.isPending}
          submitLabel={
            updateProductMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )
          }
          initialValues={{
            name: product.name,
            slug: product.slug,
            description: product.description ?? "",
            status: product.status,
            images: product.images as ProductImage[],
            variants: [],
          }}
          excludeId={product.id}
          showVariantsToggle={false}
        />
      </SheetContent>
    </Sheet>
  );
}
