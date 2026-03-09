"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";

type UpdateProductInput = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      const response = await api.products({ id: input.id }).patch({
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
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
        queryKey: ["products"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });

      toast.success("Product updated.");
    },
  });
}
