export const variantKeys = {
  all: ["variants"] as const,
  lists: () => [...variantKeys.all, "list"] as const,
  list: (productId: string) => [...variantKeys.lists(), { productId }] as const,
  details: () => [...variantKeys.all, "detail"] as const,
  detail: (id: string) => [...variantKeys.details(), id] as const,
};
