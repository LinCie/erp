"use client";

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
import { Button } from "@/shared/presentation/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDeleteVariantMutation } from "../hooks/use-delete-variant-mutation";
import type { VariantEntity } from "../../domain/variant.entity";

type DeleteVariantAlertProps = {
  productId: string;
  variant: VariantEntity;
};

export function DeleteVariantAlert({ productId, variant }: DeleteVariantAlertProps) {
  const deleteMutation = useDeleteVariantMutation(productId);

  const handleDelete = () => {
    toast.promise(deleteMutation.mutateAsync(variant.id), {
      loading: `Deleting variant "${variant.sku}"...`,
      success: "Variant deleted successfully",
      error: (err) =>
        err instanceof Error ? err.message : "Could not delete variant",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Trash2Icon className="size-4 text-destructive" />
          <span className="sr-only">Delete variant</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Variant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the variant with SKU &quot;{variant.sku}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            variant="destructive"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
