"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";
import type { UpdateVariantInput } from "@/modules/variants/application/types/variant.types";

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

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: variantKeys.list(productId),
      });
    },

    onSuccess: () => {
      toast.success("Variant updated.");
    },
  });
}
