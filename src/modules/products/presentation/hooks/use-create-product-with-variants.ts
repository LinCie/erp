"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "../hooks/product-keys";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variantApi = api as any;

type VariantInput = {
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
      // Step 1: Create the product
      const productResponse = await api.products.post({
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
      });

      if (productResponse.error) {
        throw new Error(
          (productResponse.error.value as { error?: string })?.error ||
            "Could not create product.",
        );
      }

      const product = productResponse.data;

      // Step 2: If variants were provided, bulk-create them
      if (input.variants && input.variants.length > 0) {
        const variantsResponse = await variantApi
          .products({ productId: product!.id })
          .variants.bulk.post({
            variants: input.variants,
          });

        if (variantsResponse.error) {
          // Product was created but variants failed — surface as error
          throw new Error(
            (variantsResponse.error.value as { error?: string })?.error ||
              "Product created but variants could not be saved.",
          );
        }
      }

      return product;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      toast.success("Product created.");
    },
  });
}
