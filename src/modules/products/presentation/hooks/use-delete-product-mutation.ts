"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";

type DeleteProductInput = {
  id: string;
  slug: string;
};

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteProductInput) => {
      const response = await api.products({ id: input.id }).delete();

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not delete product.",
        );
      }

      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.slug),
      });
    },
  });
}
