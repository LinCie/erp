"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variantApi = api as any;

type CreateVariantInput = {
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
};

export function useCreateVariantMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVariantInput) => {
      const response = await variantApi
        .products({ productId })
        .variants.post(input);

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
  });
}
