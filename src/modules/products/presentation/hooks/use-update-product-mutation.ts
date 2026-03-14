"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type UpdateProductInput = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  images?: ProductImage[];
};

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      const response = await api.products({ id: input.id }).patch({
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
        status: input.status,
        images: input.images,
      });

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not update product.",
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

      toast.success("Product updated.");
    },
  });
}
