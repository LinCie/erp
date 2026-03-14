import { ProductsListView } from "@/modules/products/presentation/components/products-list-view";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_SORT_ORDERS,
  PRODUCT_STATUS_VALUES,
  type ProductSortField,
  type ProductSortOrder,
  type ProductStatusValue,
} from "@/modules/products/application/types/product.types";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    sortBy?: string | string[];
    sortOrder?: string | string[];
  }>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isSortField(value: string | undefined): value is ProductSortField {
  return PRODUCT_SORT_FIELDS.includes(value as ProductSortField);
}

function isSortOrder(value: string | undefined): value is ProductSortOrder {
  return PRODUCT_SORT_ORDERS.includes(value as ProductSortOrder);
}

function isStatusValue(value: string | undefined): value is ProductStatusValue {
  return PRODUCT_STATUS_VALUES.includes(value as ProductStatusValue);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = getSingleValue(params.search) ?? "";
  const rawStatus = getSingleValue(params.status);
  const rawSortBy = getSingleValue(params.sortBy);
  const rawSortOrder = getSingleValue(params.sortOrder);

  return (
    <ProductsListView
      initialSearch={search}
      initialStatus={isStatusValue(rawStatus) ? rawStatus : undefined}
      initialSortBy={isSortField(rawSortBy) ? rawSortBy : "createdAt"}
      initialSortOrder={isSortOrder(rawSortOrder) ? rawSortOrder : "desc"}
    />
  );
}
