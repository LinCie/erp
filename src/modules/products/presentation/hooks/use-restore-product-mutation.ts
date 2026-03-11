"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";
import type { ProductEntity } from "../../domain/product.entity";

type RestoreProductInput = {
  id: string;
};

type TrashedListFilters = {
  search: string;
  page: number;
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

export function useRestoreProductMutation(filters?: TrashedListFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RestoreProductInput) => {
      const response = await api.products({ id: input.id }).restore.post();

      if (response.error) {
        throw new Error(
          response.error.value.toString() || "Could not restore product.",
        );
      }

      return response.data;
    },

    onMutate: async (input) => {
      if (!filters) return {};

      const queryKey = productKeys.trashedList(filters);
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
        queryClient.setQueryData(
          productKeys.trashedList(filters),
          context.previous,
        );
      }
    },

    onSettled: async () => {
      if (filters) {
        await queryClient.invalidateQueries({
          queryKey: productKeys.trashedList(filters),
        });
      } else {
        await queryClient.invalidateQueries({
          queryKey: productKeys.trashed(),
        });
      }

      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}
