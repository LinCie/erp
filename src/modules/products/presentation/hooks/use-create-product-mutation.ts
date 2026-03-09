"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";

type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
};

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const response = await api.products.post({
        name: input.name.trim(),
        slug: input.slug.trim(),
        description: input.description.trim() || null,
      });

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not create product.",
        );
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success("Product created.");
    },
  });
}
