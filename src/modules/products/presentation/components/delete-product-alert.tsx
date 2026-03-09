"use client";

import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/presentation/components/ui/alert-dialog";
import {
  DropdownMenuItem,
} from "@/shared/presentation/components/ui/dropdown-menu";
import { useDeleteProductMutation } from "../hooks/use-delete-product-mutation";
import type { ProductEntity } from "../../domain/product.entity";

type DeleteProductAlertProps = {
  product: ProductEntity;
  children?: React.ReactNode;
  onDeleted?: () => void;
};

export function DeleteProductAlert({ product, children, onDeleted }: DeleteProductAlertProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteProductMutation = useDeleteProductMutation();

  const handleDelete = async () => {
    setError(null);

    try {
      await deleteProductMutation.mutateAsync({ id: product.id });
      setOpen(false);
      onDeleted?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete product. Please try again."
      );
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            className="group w-full cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive/80 transition-colors group-hover:text-destructive" />
            Delete
          </DropdownMenuItem>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product
            <span className="font-semibold text-foreground"> {product.name}</span> and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive mt-2" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProductMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProductMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
