"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/presentation/components/ui/button";
import { Badge } from "@/shared/presentation/components/ui/badge";
import { cn } from "@/shared/presentation/libraries/utils";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";
import { Input } from "@/shared/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/presentation/components/ui/select";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/presentation/components/ui/table";
import type {
  ProductSortField,
  ProductSortOrder,
  ProductStatusValue,
} from "../../application/types/product.types";
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_SORT_ORDERS,
  PRODUCT_STATUS_VALUES,
} from "../../application/types/product.types";
import { ProductEntity as Product } from "../../domain/product.entity";
import { useProductsQuery } from "../hooks/use-products-query";
import { CreateProductModal } from "./create-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductAlert } from "./delete-product-alert";

type ProductsListViewProps = {
  initialSearch?: string;
  initialStatus?: ProductStatusValue;
  initialSortBy?: ProductSortField;
  initialSortOrder?: ProductSortOrder;
};

const DEFAULT_SORT_BY: ProductSortField = "createdAt";
const DEFAULT_SORT_ORDER: ProductSortOrder = "desc";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const STATUS_FILTER_VALUE_ALL = "all";

function isStatusValue(value: string | null): value is ProductStatusValue {
  return (
    value !== null &&
    PRODUCT_STATUS_VALUES.includes(value as ProductStatusValue)
  );
}

function getStatusLabel(status: ProductStatusValue): string {
  switch (status) {
    case "active":
      return "Active";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
  }
}

function getStatusBadgeVariant(
  status: ProductStatusValue,
): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "archived":
      return "secondary";
    case "draft":
      return "outline";
  }
}

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

function useColumns(
  sortBy: ProductSortField,
  sortOrder: ProductSortOrder,
  onSortChange: (field: ProductSortField) => void,
  filters: {
    search: string;
    page: number;
    status?: ProductStatusValue;
    sortBy: ProductSortField;
    sortOrder: ProductSortOrder;
  },
): ColumnDef<Product>[] {
  return useMemo(() => {
    const getAriaSort = (
      field: ProductSortField,
    ): "ascending" | "descending" | "none" => {
      if (sortBy !== field) return "none";
      return sortOrder === "asc" ? "ascending" : "descending";
    };

    const renderSortableHeader = (field: ProductSortField, label: string) => (
      <Button
        variant="ghost"
        onClick={() => onSortChange(field)}
        aria-sort={getAriaSort(field)}
      >
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
        cell: ({ row }) =>
          row.original.description ? (
            row.original.description
          ) : (
            <span className="text-muted-foreground italic">No description</span>
          ),
      },
      {
        accessorKey: "status",
        header: () => renderSortableHeader("status", "Status"),
        cell: ({ row }) => (
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {getStatusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => renderSortableHeader("createdAt", "Created"),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 w-11 p-0"
                  aria-label={`Actions for ${product.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group w-full cursor-pointer font-medium"
                    target="_blank"
                  >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    View
                  </Link>
                </DropdownMenuItem>
                <EditProductModal product={product} />
                <DropdownMenuSeparator />
                <DeleteProductAlert
                  product={product}
                  filters={{
                    search: filters.search,
                    page: filters.page,
                    status: filters.status,
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
  }, [sortBy, sortOrder, onSortChange, filters]);
}

export function ProductsListView({
  initialSearch = "",
  initialStatus,
  initialSortBy = DEFAULT_SORT_BY,
  initialSortOrder = DEFAULT_SORT_ORDER,
}: ProductsListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawSortBy = searchParams.get("sortBy");
  const sortBy = isSortField(rawSortBy) ? rawSortBy : initialSortBy;

  const rawSortOrder = searchParams.get("sortOrder");
  const sortOrder = isSortOrder(rawSortOrder) ? rawSortOrder : initialSortOrder;

  const rawStatus = searchParams.get("status");
  const status = isStatusValue(rawStatus) ? rawStatus : initialStatus;

  const rawPage = searchParams.get("page");
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : DEFAULT_PAGE;

  const search = searchParams.get("search") ?? initialSearch;

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      updateUrl({
        search: trimmed || null,
        page: null,
      });
    }, 400);
  };

  const handleSortChange = (field: ProductSortField) => {
    const nextOrder: ProductSortOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc";

    const params: Record<string, string | null> = {
      sortBy: field === DEFAULT_SORT_BY ? null : field,
      sortOrder: nextOrder === DEFAULT_SORT_ORDER ? null : nextOrder,
      page: null,
    };

    updateUrl(params);
  };

  const handleStatusChange = (value: string) => {
    updateUrl({
      status: value === STATUS_FILTER_VALUE_ALL ? null : value,
      page: null,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({
      page: newPage <= 1 ? null : String(newPage),
    });
  };

  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useProductsQuery({
    search,
    page,
    limit: DEFAULT_LIMIT,
    status,
    sortBy,
    sortOrder,
  });

  const products = result?.data ?? [];
  const metadata = result?.metadata;

  const columns = useColumns(
    sortBy,
    sortOrder,
    handleSortChange,
    { search, page, status, sortBy, sortOrder },
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const skeletonRows = useMemo(
    () => Array.from({ length: Math.min(DEFAULT_LIMIT, metadata?.total ?? DEFAULT_LIMIT) }),
    [metadata?.total],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="w-full pl-10 sm:w-64 md:w-80"
                aria-label="Search products"
              />
            </div>
            <Select
              value={status ?? STATUS_FILTER_VALUE_ALL}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filter by product status"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STATUS_FILTER_VALUE_ALL}>
                  All statuses
                </SelectItem>
                {PRODUCT_STATUS_VALUES.map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {getStatusLabel(statusValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <CreateProductModal />
            <Link href="/products/trash">
              <Button variant="ghost" size="sm" aria-label="View deleted products in trash">
                Trash
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
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
              skeletonRows.map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-37.5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-30" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-62.5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-18 rounded-4xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-25" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-11 w-11 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  role="status"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>Could not load products.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      Try again
                    </Button>
                  </div>
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
            ) : search || status ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  role="status"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>
                      No products match the current filters
                      {search ? (
                        <>
                          {" "}for &ldquo;{search}&rdquo;
                        </>
                      ) : null}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchInput("");
                        updateUrl({
                          search: null,
                          status: null,
                          page: null,
                        });
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  role="status"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>No products yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first product to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {metadata && metadata.totalPages > 1 ? (
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" role="status">
            Showing {(page - 1) * DEFAULT_LIMIT + 1}–
            {Math.min(page * DEFAULT_LIMIT, metadata.total)} of {metadata.total}{" "}
            products
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : undefined}
                  className={cn(
                    page <= 1 && "cursor-not-allowed opacity-50",
                    page > 1 && "cursor-pointer",
                  )}
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
                        aria-current={item === page ? "page" : undefined}
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
                    if (page < metadata.totalPages) handlePageChange(page + 1);
                  }}
                  aria-disabled={page >= metadata.totalPages}
                  tabIndex={page >= metadata.totalPages ? -1 : undefined}
                  className={cn(
                    page >= metadata.totalPages && "cursor-not-allowed opacity-50",
                    page < metadata.totalPages && "cursor-pointer",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
