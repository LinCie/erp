"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";
import type { CreateVariantInput } from "../schemas/variant-schema";
import type { VariantEntity } from "../../domain/variant.entity";

type VariantsQueryData = {
  data: VariantEntity[];
  meta: { total: number };
};

export function useCreateVariantMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVariantInput) => {
      const response = await api
        .products({ id: productId })
        .variants.post({
          ...input,
          currency: input.currency ?? "USD",
          isDefault: input.isDefault ?? false,
        });

      if (response.error) {
        throw new Error(
          (response.error.value as { error?: string })?.error ||
            "Could not create variant.",
        );
      }

      return response.data;
    },

    /**
     * Optimistic update: immediately append a placeholder variant to the
     * cached list so the UI feels instant. The placeholder uses a temporary
     * ID that gets replaced when invalidateQueries refetches the real data.
     */
    onMutate: async (input) => {
      const queryKey = variantKeys.list(productId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<VariantsQueryData>(queryKey);

      if (previous) {
        const optimisticVariant: VariantEntity = {
          id: `temp-${Date.now()}`,
          productId,
          name: input.name,
          sku: input.sku,
          status: input.status,
          basePrice: input.basePrice,
          salePrice: input.salePrice ?? null,
          costPrice: input.costPrice ?? null,
          currency: input.currency ?? "USD",
          isDefault: input.isDefault ?? false,
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData<VariantsQueryData>(queryKey, {
          data: [...previous.data, optimisticVariant],
          meta: { total: previous.meta.total + 1 },
        });
      }

      return { previous };
    },

    onError: (error: Error, _input, context) => {
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
      toast.success("Variant created.");
    },
  });
}
