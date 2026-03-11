"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";
import type { CreateVariantInput } from "../schemas/variant-schema";

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: variantKeys.list(productId),
      });

      toast.success("Variant created.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
