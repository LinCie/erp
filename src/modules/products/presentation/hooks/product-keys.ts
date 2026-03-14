export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: {
    search: string;
    page: number;
    status?: string;
    sortBy: string;
    sortOrder: string;
  }) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  trashed: () => [...productKeys.all, "trashed"] as const,
  trashedList: (filters: {
    search: string;
    page: number;
    sortBy: string;
    sortOrder: string;
  }) => [...productKeys.trashed(), filters] as const,
};
