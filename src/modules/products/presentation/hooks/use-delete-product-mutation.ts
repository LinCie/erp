"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/presentation/libraries/api-client";

type DeleteProductInput = {
  id: string;
};

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteProductInput) => {
      const response = await api.products({ id: input.id }).delete();

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not delete product.",
        );
      }

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success("Product deleted.");
    },
  });
}
