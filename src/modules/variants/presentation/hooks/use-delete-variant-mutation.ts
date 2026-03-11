"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";
import type { VariantEntity } from "../../domain/variant.entity";

type VariantsQueryData = {
  data: VariantEntity[];
  meta: { total: number };
};

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

    /**
     * Optimistic update: immediately remove the variant from the cached
     * list so it disappears from the table without waiting for the server.
     */
    onMutate: async (variantId) => {
      const queryKey = variantKeys.list(productId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<VariantsQueryData>(queryKey);

      if (previous) {
        queryClient.setQueryData<VariantsQueryData>(queryKey, {
          data: previous.data.filter((v) => v.id !== variantId),
          meta: { total: Math.max(0, previous.meta.total - 1) },
        });
      }

      return { previous };
    },

    onError: (_error: Error, _variantId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          variantKeys.list(productId),
          context.previous,
        );
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: variantKeys.list(productId),
      });
    },
  });
}
