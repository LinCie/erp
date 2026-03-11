"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/presentation/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";
import { Input } from "@/shared/presentation/components/ui/input";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/presentation/components/ui/table";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import type {
  ProductSortField,
  ProductSortOrder,
} from "../../application/types/product.types";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_SORT_ORDERS,
} from "../../application/types/product.types";
import { ProductEntity as Product } from "../../domain/product.entity";
import { useTrashedProductsQuery } from "../hooks/use-trashed-products-query";
import { RestoreProductAlert } from "./restore-product-alert";
import { PermanentDeleteProductAlert } from "./permanent-delete-product-alert";

type ProductsTrashListViewProps = {
  initialSearch?: string;
  initialSortBy?: ProductSortField;
  initialSortOrder?: ProductSortOrder;
};

const DEFAULT_SORT_BY: ProductSortField = "createdAt";
const DEFAULT_SORT_ORDER: ProductSortOrder = "desc";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function isSortField(value: string | null): value is ProductSortField {
  return (
    value !== null && PRODUCT_SORT_FIELDS.includes(value as ProductSortField)
  );
}

function isSortOrder(value: string | null): value is ProductSortOrder {
  return (
    value !== null && PRODUCT_SORT_ORDERS.includes(value as ProductSortOrder)
  );
}

function getSortIcon(sortOrder: ProductSortOrder | undefined) {
  if (sortOrder === "asc") {
    return <ArrowUp data-icon="inline-end" />;
  }

  if (sortOrder === "desc") {
    return <ArrowDown data-icon="inline-end" />;
  }

  return <ArrowUpDown data-icon="inline-end" />;
}

function createColumns(
  sortBy: ProductSortField,
  sortOrder: ProductSortOrder,
  onSortChange: (field: ProductSortField) => void,
  filters: {
    search: string;
    page: number;
    sortBy: ProductSortField;
    sortOrder: ProductSortOrder;
  },
): ColumnDef<Product>[] {
  const renderSortableHeader = (field: ProductSortField, label: string) => (
    <Button variant="ghost" onClick={() => onSortChange(field)}>
      {label}
      {getSortIcon(sortBy === field ? sortOrder : undefined)}
    </Button>
  );

  return [
    {
      accessorKey: "name",
      header: () => renderSortableHeader("name", "Name"),
    },
    {
      accessorKey: "slug",
      header: () => renderSortableHeader("slug", "Slug"),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "No description",
    },
    {
      accessorKey: "deletedAt",
      header: () => renderSortableHeader("deletedAt", "Deleted"),
      cell: ({ row }) =>
        row.original.deletedAt
          ? new Date(row.original.deletedAt).toLocaleDateString()
          : "N/A",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RestoreProductAlert
                product={product}
                filters={{
                  search: filters.search,
                  page: filters.page,
                  sortBy: filters.sortBy,
                  sortOrder: filters.sortOrder,
                }}
              />
              <DropdownMenuSeparator />
              <PermanentDeleteProductAlert
                product={product}
                filters={{
                  search: filters.search,
                  page: filters.page,
                  sortBy: filters.sortBy,
                  sortOrder: filters.sortOrder,
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export function ProductsTrashListView({
  initialSearch = "",
  initialSortBy = DEFAULT_SORT_BY,
  initialSortOrder = DEFAULT_SORT_ORDER,
}: ProductsTrashListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, 400);

  const rawSortBy = searchParams.get("sortBy");
  const rawSortOrder = searchParams.get("sortOrder");
  const sortBy = isSortField(rawSortBy) ? rawSortBy : initialSortBy;
  const sortOrder = isSortOrder(rawSortOrder) ? rawSortOrder : initialSortOrder;

  const rawPage = searchParams.get("page");
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : DEFAULT_PAGE;

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    setSearch(params.get("search") ?? initialSearch);
  }, [initialSearch, searchParamsString]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const nextSearch = debouncedSearch.trim();

    if (nextSearch) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    if (sortBy === DEFAULT_SORT_BY) {
      params.delete("sortBy");
    } else {
      params.set("sortBy", sortBy);
    }

    if (sortOrder === DEFAULT_SORT_ORDER) {
      params.delete("sortOrder");
    } else {
      params.set("sortOrder", sortOrder);
    }

    params.delete("page");

    const nextQuery = params.toString();
    const currentQuery = searchParamsString;

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }
  }, [
    debouncedSearch,
    pathname,
    router,
    searchParamsString,
    sortBy,
    sortOrder,
  ]);

  const {
    data: result,
    isLoading,
    error,
  } = useTrashedProductsQuery({
    search: debouncedSearch,
    page,
    limit: DEFAULT_LIMIT,
    sortBy,
    sortOrder,
  });

  const products = result?.data ?? [];
  const metadata = result?.metadata;

  const columns = createColumns(
    sortBy,
    sortOrder,
    (field) => {
      const params = new URLSearchParams(searchParamsString);
      const nextOrder: ProductSortOrder =
        sortBy === field && sortOrder === "asc" ? "desc" : "asc";

      params.set("sortBy", field);
      params.set("sortOrder", nextOrder);
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    { search: debouncedSearch, page, sortBy, sortOrder },
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParamsString);

    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="sm">
              Back to Products
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Products Trash</h1>
        </div>
        <Input
          placeholder="Search trashed products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Could not load trashed products. Please try again.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No deleted products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {metadata && metadata.totalPages > 1 ? (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * DEFAULT_LIMIT + 1}–
            {Math.min(page * DEFAULT_LIMIT, metadata.total)} of {metadata.total}{" "}
            deleted products
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: metadata.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (p === 1 || p === metadata.totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        isActive={item === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(item);
                        }}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page + 1);
                  }}
                  aria-disabled={page >= metadata.totalPages}
                  className={
                    page >= metadata.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
