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
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useProductsQuery } from "../hooks/use-products-query";
import { CreateProductModal } from "./create-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductAlert } from "./delete-product-alert";

type ProductsListViewProps = {
  initialSearch?: string;
  initialSortBy?: ProductSortField;
  initialSortOrder?: ProductSortOrder;
};

const DEFAULT_SORT_BY: ProductSortField = "createdAt";
const DEFAULT_SORT_ORDER: ProductSortOrder = "desc";

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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
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
              <DeleteProductAlert product={product} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export function ProductsListView({
  initialSearch = "",
  initialSortBy = DEFAULT_SORT_BY,
  initialSortOrder = DEFAULT_SORT_ORDER,
}: ProductsListViewProps) {
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
    data: products = [],
    isLoading,
    error,
  } = useProductsQuery({
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const columns = createColumns(sortBy, sortOrder, (field) => {
    const params = new URLSearchParams(searchParamsString);
    const nextOrder: ProductSortOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc";

    params.set("sortBy", field);
    params.set("sortOrder", nextOrder);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
          <CreateProductModal />
        </div>
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
              Array.from({ length: 10 }).map((_, index) => (
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
                  Could not load products. Please try again.
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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
