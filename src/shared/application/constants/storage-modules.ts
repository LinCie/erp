export const ALLOWED_STORAGE_MODULES = [
  "products",
  "organizations",
  "users",
  "general",
] as const;

export type StorageModule = (typeof ALLOWED_STORAGE_MODULES)[number];
