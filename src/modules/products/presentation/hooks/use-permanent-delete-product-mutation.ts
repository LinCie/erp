"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";

type PermanentDeleteProductInput = {
  id: string;
  organizationId: string;
};

export function usePermanentDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PermanentDeleteProductInput) => {
      const response = await api.products({ id: input.id }).permanent.delete();

      if (response.error) {
        throw new Error(
          response.error.value.toString() ||
            "Could not permanently delete product.",
        );
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.trashed(),
      });

      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      toast.success("Product permanently deleted.");
    },
  });
}
