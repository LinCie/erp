"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";

export function useDeleteVariantMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantId: string) => {
      const response = await api
        .products({ id: productId })
        .variants({ variantId })
        .delete();

      if (response.error) {
        throw new Error(
          (response.error.value as { error?: string })?.error ||
            "Could not delete variant."
        );
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: variantKeys.list(productId),
      });

      toast.success("Variant deleted.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
