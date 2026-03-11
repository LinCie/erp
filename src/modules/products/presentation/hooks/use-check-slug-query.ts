"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/presentation/libraries/api-client";
import { productKeys } from "./product-keys";

type UseCheckSlugQueryInput = {
  slug: string | undefined;
  excludeId?: string;
  enabled?: boolean;
};

type SlugAvailabilityResult = {
  available: boolean;
  existingProductId?: string;
};

export const slugCheckKeys = {
  check: (slug: string, excludeId?: string) =>
    [...productKeys.all, "slug-check", slug, excludeId] as const,
};

export function useCheckSlugQuery({
  slug,
  excludeId,
  enabled = true,
}: UseCheckSlugQueryInput) {
  const normalizedSlug = slug?.trim() ?? "";

  return useQuery<SlugAvailabilityResult>({
    queryKey: slugCheckKeys.check(normalizedSlug, excludeId),
    queryFn: async ({ signal }) => {
      const response = await api.products["check-slug"]({ slug: normalizedSlug }).get({
        query: excludeId ? { excludeId } : undefined,
        fetch: { signal },
      });

      if (response.error) {
        throw new Error("Could not check slug availability.");
      }

      return {
        available: response.data.isAvailable,
      };
    },
    enabled: enabled && normalizedSlug.length >= 3,
    staleTime: 10_000,
    retry: false,
  });
}
