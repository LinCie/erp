"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { variantKeys } from "./variant-keys";

type UseCheckSkuQueryInput = {
  /** The SKU string to check. Pass empty string or undefined to skip. */
  sku: string | undefined;
  /** Variant ID to exclude from the check (used when editing an existing variant). */
  excludeId?: string;
  /** Product ID — used to scope the endpoint call. */
  productId: string;
  /** Enable flag — set false to disable the query (e.g. while debouncing). */
  enabled?: boolean;
};

type SkuAvailabilityResult = {
  available: boolean;
  existingVariantId?: string;
};

export const skuCheckKeys = {
  check: (productId: string, sku: string, excludeId?: string) =>
    [...variantKeys.all, "sku-check", productId, sku, excludeId] as const,
};

/**
 * Query hook that checks SKU availability against the backend.
 * Should be used with a debounced SKU value (see useDebounce utility).
 */
export function useCheckSkuQuery({
  sku,
  excludeId,
  productId,
  enabled = true,
}: UseCheckSkuQueryInput) {
  const normalizedSku = sku?.trim() ?? "";

  return useQuery<SkuAvailabilityResult>({
    queryKey: skuCheckKeys.check(productId, normalizedSku, excludeId),
    queryFn: async ({ signal }) => {
      const response = await api
        .products({ id: productId })
        .variants["check-sku"].get({
          query: {
            sku: normalizedSku,
            excludeId,
          },
          fetch: { signal },
        });

      if (response.error) {
        throw new Error("Could not check SKU availability.");
      }

      return response.data as SkuAvailabilityResult;
    },
    enabled: enabled && Boolean(productId) && normalizedSku.length >= 3,
    // Cache for 10s — SKUs don't change that quickly, but we still want
    // reasonably fresh data during form filling.
    staleTime: 10_000,
    // Don't retry on error — the user is typing, just show a neutral state
    retry: false,
  });
}
