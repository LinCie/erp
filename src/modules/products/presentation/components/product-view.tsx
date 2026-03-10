"use client";

import { useBreadcrumbOverride } from "@/shared/presentation/hooks/use-breadcrumbs";
import { useProductQuery } from "../hooks/use-product-query";
import { Button } from "@/shared/presentation/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductAlert } from "./delete-product-alert";
import { useRouter } from "next/navigation";
import { useVariantsQuery } from "@/modules/variants/presentation/hooks/use-variants-query";
import { VariantListView } from "@/modules/variants/presentation/components/variant-list-view";

export function ProductView({ slug }: { slug: string }) {
  const { data: product, isLoading, error } = useProductQuery(slug);
  const router = useRouter();

  useBreadcrumbOverride(`/products/${slug}`, product?.name);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="border-b pb-3 mb-1">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-4 mt-2">
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-4 w-10 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-6 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="border-b pb-3 mb-1">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4 mt-2">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive font-medium border border-destructive/20 bg-destructive/10 px-4 py-2 rounded-md">
          {error?.message || "Product not found."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Product Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <EditProductModal product={product}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </EditProductModal>
          <DeleteProductAlert
            product={product}
            onDeleted={() => router.push("/products")}
          >
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DeleteProductAlert>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold text-lg border-b pb-2 mb-2">
            General Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-flex">
                {product.slug}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm">
                {product.description || "No description provided."}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-sm font-mono text-muted-foreground">
                {product.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold text-lg border-b pb-2 mb-2">Metadata</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-sm">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(product.createdAt))}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(product.updatedAt))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <VariantsSection productId={product.id} />
    </div>
  );
}

function VariantsSection({ productId }: { productId: string }) {
  const { data, isLoading, error } = useVariantsQuery({ productId });

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-lg">Variants</h3>
      <VariantListView
        productId={productId}
        variants={data?.data}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
