"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "../hooks/product-keys";

type VariantInput = {
  name: string;
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  isDefault?: boolean;
};

type CreateProductWithVariantsInput = {
  name: string;
  slug: string;
  description: string;
  variants?: VariantInput[];
};

export function useCreateProductWithVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductWithVariantsInput) => {
      // Backend now handles variant creation (or auto-default generation)
      // in a single POST /products call
      const response = await api.products.post({
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
        variants:
          input.variants && input.variants.length > 0
            ? input.variants
            : undefined,
      });

      if (response.error) {
        throw new Error(
          (response.error.value as { error?: string })?.error ||
            "Could not create product.",
        );
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      toast.success("Product created.");
    },
  });
}
