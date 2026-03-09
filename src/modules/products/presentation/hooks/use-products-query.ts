"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { ProductEntity } from "../../domain/product.entity";
import type {
  ProductSortField,
  ProductSortOrder,
} from "../../application/types/product.types";

type UseProductsQueryInput = {
  search: string;
  sortBy: ProductSortField;
  sortOrder: ProductSortOrder;
};

export function useProductsQuery({
  search,
  sortBy,
  sortOrder,
}: UseProductsQueryInput) {
  return useQuery<ProductEntity[]>({
    queryKey: ["products", search, sortBy, sortOrder],
    queryFn: async ({ signal }) => {
      const response = await api.products.get({
        query: {
          search: search.trim() || undefined,
          sortBy,
          sortOrder,
        },
        fetch: {
          signal,
        },
      });

      if (response.error) {
        throw new Error("Could not load products. Please try again.");
      }

      return response.data.data;
    },
  });
}
