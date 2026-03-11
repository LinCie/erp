"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";

type RestoreProductInput = {
  id: string;
};

export function useRestoreProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RestoreProductInput) => {
      const response = await api.products({ id: input.id }).restore.post();

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not restore product.",
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
    },
  });
}
