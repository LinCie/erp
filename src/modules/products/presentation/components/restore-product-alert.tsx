"use client";

import React, { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
  const restoreProductMutation = useRestoreProductMutation();

  const handleRestore = () => {
    toast.promise(
      restoreProductMutation.mutateAsync({
        id: product.id,
      }),
      {
        loading: `Restoring "${product.name}"...`,
        success: () => {
          setOpen(false);
          onRestored?.();
          return "Product restored successfully";
        },
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Could not restore product. Please try again.",
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
