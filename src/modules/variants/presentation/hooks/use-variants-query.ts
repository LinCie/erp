"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import type { VariantEntity } from "../../domain/variant.entity";
import { variantKeys } from "./variant-keys";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variantApi = api as any;

type UseVariantsQueryInput = {
  productId: string;
};

export function useVariantsQuery({ productId }: UseVariantsQueryInput) {
  return useQuery<{
    data: VariantEntity[];
    meta: { total: number };
  }>({
    queryKey: variantKeys.list(productId),
    queryFn: async ({ signal }) => {
      const response = await variantApi
        .products({ productId })
        .variants.get({ fetch: { signal } });

      if (response.error) {
        throw new Error("Could not load variants. Please try again.");
      }

      return response.data as {
        data: VariantEntity[];
        meta: { total: number };
      };
    },
    enabled: Boolean(productId),
  });
}
