"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";
import type { ProductEntity } from "../../domain/product.entity";

type DeleteProductInput = {
  id: string;
  slug: string;
};

export type ProductListFilters = {
  search: string;
  page: number;
  status?: string;
  sortBy: string;
  sortOrder: string;
};

type ProductsQueryData = {
  data: ProductEntity[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useDeleteProductMutation(filters?: ProductListFilters) {
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

    onMutate: async (input) => {
      if (!filters) return {};

      const queryKey = productKeys.list(filters);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ProductsQueryData>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProductsQueryData>(queryKey, {
          data: previous.data.filter((p) => p.id !== input.id),
          metadata: {
            ...previous.metadata,
            total: Math.max(0, previous.metadata.total - 1),
          },
        });
      }

      return { previous };
    },

    onError: (_error: Error, _input, context) => {
      if (context?.previous && filters) {
        queryClient.setQueryData(productKeys.list(filters), context.previous);
      }
    },

    onSettled: async (_, __, variables) => {
      if (filters) {
        await queryClient.invalidateQueries({
          queryKey: productKeys.list(filters),
        });
      } else {
        await queryClient.invalidateQueries({
          queryKey: productKeys.lists(),
        });
      }

      await queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.slug),
      });
    },
  });
}
