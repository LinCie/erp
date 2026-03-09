import { api } from "@/shared/presentation/libraries/api-client";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function checkSlugAvailability(
  slug: string,
  signal: AbortSignal,
  excludeId?: string,
): Promise<boolean> {
  const response = await api.products["check-slug"]({ slug }).get({
    query: excludeId ? { excludeId } : undefined,
    fetch: {
      signal,
    },
  });

  if (response.error) {
    throw new Error("Could not validate slug. Please try again.");
  }

  return response.data.isAvailable;
}
