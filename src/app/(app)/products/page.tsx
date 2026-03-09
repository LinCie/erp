import { ProductsListView } from "@/modules/products/presentation/components/products-list-view";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_SORT_ORDERS,
  type ProductSortField,
  type ProductSortOrder,
} from "@/modules/products/application/types/product.types";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string | string[];
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = getSingleValue(params.search) ?? "";
  const rawSortBy = getSingleValue(params.sortBy);
  const rawSortOrder = getSingleValue(params.sortOrder);

  return (
    <ProductsListView
      initialSearch={search}
      initialSortBy={isSortField(rawSortBy) ? rawSortBy : "createdAt"}
      initialSortOrder={isSortOrder(rawSortOrder) ? rawSortOrder : "desc"}
    />
  );
}
