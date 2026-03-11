"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { ProductEntity } from "../../domain/product.entity";
import type {
  ProductSortField,
  ProductSortOrder,
} from "../../application/types/product.types";
import { productKeys } from "./product-keys";

type UseTrashedProductsQueryInput = {
  search: string;
  page?: number;
  limit?: number;
  sortBy: ProductSortField;
  sortOrder: ProductSortOrder;
};

export function useTrashedProductsQuery({
  search,
  page = 1,
  limit = 10,
  sortBy,
  sortOrder,
}: UseTrashedProductsQueryInput) {
  return useQuery<{
    data: ProductEntity[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: productKeys.trashedList({ search, page: page ?? 1, sortBy, sortOrder }),
    queryFn: async ({ signal }) => {
      const response = await api.products.trash.get({
        query: {
          search: search.trim() || undefined,
          page,
          limit,
          sortBy,
          sortOrder,
        },
        fetch: {
          signal,
        },
      });

      if (response.error) {
        throw new Error("Could not load trashed products. Please try again.");
      }

      return response.data;
    },
  });
}
