export type LocationType = "warehouse" | "zone" | "aisle" | "bin" | "receiving" | "shipping";

type LocationEntity = {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type { LocationEntity };
