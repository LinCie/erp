"use client";

import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/presentation/components/ui/table";
import type { VariantEntity } from "../../domain/variant.entity";
import { Badge } from "@/shared/presentation/components/ui/badge";

type VariantListViewProps = {
  productId: string;
  variants?: VariantEntity[];
  isLoading?: boolean;
  error?: Error | null;
  renderActions?: (variant: VariantEntity) => React.ReactNode;
};

const COLUMNS: ColumnDef<VariantEntity>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: "basePrice",
    header: "Base Price",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(row.original.basePrice),
  },
  {
    accessorKey: "salePrice",
    header: "Sale Price",
    cell: ({ row }) =>
      row.original.salePrice != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: row.original.currency,
          }).format(row.original.salePrice)
        : "—",
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) =>
      row.original.isDefault ? (
        <Badge variant="secondary">Default</Badge>
      ) : null,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

function getColumnsWithActions(
  renderActions?: (variant: VariantEntity) => React.ReactNode
): ColumnDef<VariantEntity>[] {
  if (!renderActions) return COLUMNS;

  return [
    ...COLUMNS,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">{renderActions(row.original)}</div>
      ),
    },
  ];
}

export function VariantListView({
  variants,
  isLoading,
  error,
  renderActions,
}: VariantListViewProps) {
  const columns = getColumnsWithActions(renderActions);
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: variants ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[90px]" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-destructive"
              >
                Could not load variants. Please try again.
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No variants yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
