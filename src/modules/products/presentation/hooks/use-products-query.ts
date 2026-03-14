"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { ProductEntity } from "../../domain/product.entity";
import type {
  ProductSortField,
  ProductSortOrder,
  ProductStatusValue,
} from "../../application/types/product.types";
import { productKeys } from "./product-keys";

type UseProductsQueryInput = {
  search: string;
  page?: number;
  limit?: number;
  status?: ProductStatusValue;
  sortBy: ProductSortField;
  sortOrder: ProductSortOrder;
};

export function useProductsQuery({
  search,
  page = 1,
  limit = 10,
  status,
  sortBy,
  sortOrder,
}: UseProductsQueryInput) {
  return useQuery<{
    data: ProductEntity[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: productKeys.list({ search, page, status, sortBy, sortOrder }),
    queryFn: async ({ signal }) => {
      const response = await api.products.get({
        query: {
          search: search.trim() || undefined,
          page,
          limit,
          status,
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

      return response.data;
    },
  });
}
