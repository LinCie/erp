"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";
import type { UpdateVariantInput } from "@/modules/variants/application/types/variant.types";
import type { VariantEntity } from "../../domain/variant.entity";

type VariantsQueryData = {
  data: VariantEntity[];
  meta: { total: number };
};

export function useUpdateVariantMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      input,
    }: {
      variantId: string;
      input: UpdateVariantInput;
    }) => {
      const response = await api
        .products({ id: productId })
        .variants({ variantId })
        .patch(input);

      if (response.error) {
        throw new Error(
          (response.error.value as { error?: string })?.error ||
            "Could not update variant."
        );
      }

      return response.data;
    },

    /**
     * Optimistic update: immediately apply the patch to the cached variant
     * so the table updates without waiting for the server round-trip.
     */
    onMutate: async ({ variantId, input }) => {
      const queryKey = variantKeys.list(productId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<VariantsQueryData>(queryKey);

      if (previous) {
        queryClient.setQueryData<VariantsQueryData>(queryKey, {
          ...previous,
          data: previous.data.map((v) =>
            v.id === variantId
              ? { ...v, ...input, updatedAt: new Date() }
              : v,
          ),
        });
      }

      return { previous };
    },

    onError: (error: Error, _variables, context) => {
      // Roll back to the previous cache state on failure
      if (context?.previous) {
        queryClient.setQueryData(
          variantKeys.list(productId),
          context.previous,
        );
      }
      toast.error(error.message);
    },

    onSettled: async () => {
      // Always refetch to ensure the cache matches the server
      await queryClient.invalidateQueries({
        queryKey: variantKeys.list(productId),
      });
    },

    onSuccess: () => {
      toast.success("Variant updated.");
    },
  });
}
