"use client";

import React, { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
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
import { DropdownMenuItem } from "@/shared/presentation/components/ui/dropdown-menu";
import { useRestoreProductMutation } from "../hooks/use-restore-product-mutation";
import type { ProductEntity } from "../../domain/product.entity";

type RestoreProductAlertProps = {
  product: ProductEntity;
  children?: React.ReactNode;
  onRestored?: () => void;
};

export function RestoreProductAlert({
  product,
  children,
  onRestored,
}: RestoreProductAlertProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restoreProductMutation = useRestoreProductMutation();

  const handleRestore = async () => {
    setError(null);

    try {
      await restoreProductMutation.mutateAsync({
        id: product.id,
      });
      setOpen(false);
      onRestored?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not restore product. Please try again.",
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
            className="group w-full cursor-pointer font-medium"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Product</AlertDialogTitle>
          <AlertDialogDescription>
            This will restore the product
            <span className="font-semibold text-foreground">
              {" "}
              {product.name}
            </span>{" "}
            and make it visible in your products list again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive mt-2" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={restoreProductMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={restoreProductMutation.isPending}
          >
            {restoreProductMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
