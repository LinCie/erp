"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { ProductEntity } from "../../domain/product.entity";

export function useProductQuery(slug: string) {
  return useQuery<ProductEntity>({
    queryKey: ["product", slug],
    queryFn: async ({ signal }) => {
      const response = await api.products.slug({ slug }).get({
        fetch: { signal },
      });

      if (response.error) {
        const errorVal = response.error.value as { error?: string };
        throw new Error(
          errorVal?.error || "Could not load product. Please try again.",
        );
      }

      return response.data as ProductEntity;
    },
    enabled: !!slug,
  });
}
