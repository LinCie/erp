"use client";

import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { usePermanentDeleteProductMutation } from "../hooks/use-permanent-delete-product-mutation";
import type { ProductEntity } from "../../domain/product.entity";

type PermanentDeleteProductAlertProps = {
  product: ProductEntity;
  children?: React.ReactNode;
  onDeleted?: () => void;
};

export function PermanentDeleteProductAlert({
  product,
  children,
  onDeleted,
}: PermanentDeleteProductAlertProps) {
  const [open, setOpen] = useState(false);
  const permanentDeleteProductMutation = usePermanentDeleteProductMutation();

  const handleDelete = () => {
    toast.promise(
      permanentDeleteProductMutation.mutateAsync({
        id: product.id,
        organizationId: product.organizationId,
      }),
      {
        loading: `Permanently deleting "${product.name}"...`,
        success: () => {
          setOpen(false);
          onDeleted?.();
          return "Product permanently deleted";
        },
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Could not permanently delete product. Please try again.",
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
            className="group w-full cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive/80 transition-colors group-hover:text-destructive" />
            Delete Permanently
          </DropdownMenuItem>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product
            <span className="font-semibold text-foreground">
              {" "}
              {product.name}
            </span>{" "}
            and remove it from our servers forever. You will not be able to
            recover this product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={permanentDeleteProductMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={permanentDeleteProductMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {permanentDeleteProductMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
