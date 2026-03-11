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
import { useDeleteVariantMutation } from "../hooks/use-delete-variant-mutation";
import type { VariantEntity } from "../../domain/variant.entity";

type DeleteVariantAlertProps = {
  productId: string;
  variant: VariantEntity;
};

export function DeleteVariantAlert({ productId, variant }: DeleteVariantAlertProps) {
  const deleteMutation = useDeleteVariantMutation(productId);

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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(variant.id)}
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
