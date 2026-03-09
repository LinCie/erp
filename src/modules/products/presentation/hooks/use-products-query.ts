"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { ProductEntity } from "../../domain/product.entity";

export function useProductsQuery(search: string) {
  return useQuery<ProductEntity[]>({
    queryKey: ["products", search],
    queryFn: async ({ signal }) => {
      const response = await api.products.get({
        query: {
          search: search.trim() || undefined,
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
