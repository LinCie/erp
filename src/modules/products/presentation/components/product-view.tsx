"use client";

import { useBreadcrumbOverride } from "@/shared/presentation/hooks/use-breadcrumbs";
import { useProductQuery } from "../hooks/use-product-query";
import { Button } from "@/shared/presentation/components/ui/button";
import { Separator } from "@/shared/presentation/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";
import { ArrowLeft, Info, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { EditProductModal } from "./edit-product-modal";
import { DeleteProductAlert } from "./delete-product-alert";
import { useRouter } from "next/navigation";
import { useVariantsQuery } from "@/modules/variants/presentation/hooks/use-variants-query";
import { VariantListView } from "@/modules/variants/presentation/components/variant-list-view";
import { CreateVariantModal } from "@/modules/variants/presentation/components/create-variant-modal";
import { EditVariantModal } from "@/modules/variants/presentation/components/edit-variant-modal";
import { DeleteVariantAlert } from "@/modules/variants/presentation/components/delete-variant-alert";
import { ProductImageGallery } from "./product-image-gallery";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

export function ProductView({ slug }: { slug: string }) {
  const { data: product, isLoading, error } = useProductQuery(slug);
  const router = useRouter();

  useBreadcrumbOverride(`/products/${slug}`, product?.name);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-56" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>

        {/* Detail fields skeleton */}
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className={i === 2 ? "h-10 w-full" : "h-5 w-2/3"} />
            </div>
          ))}
          <Separator />
          <div className="flex gap-8">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Images skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-16" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        <Separator />

        {/* Variants skeleton */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center p-8 gap-4">
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
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to products">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
              Product Details
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Product actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditProductModal product={product}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </EditProductModal>
            <DropdownMenuSeparator />
            <DeleteProductAlert
              product={product}
              onDeleted={() => router.push("/products")}
            >
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteProductAlert>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Product details */}
      <section aria-labelledby="details-heading">
        <h2 id="details-heading" className="sr-only">
          Product Details
        </h2>
        <dl className="flex flex-col gap-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Name
            </dt>
            <dd className="text-sm font-medium">{product.name}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Slug
            </dt>
            <dd className="text-sm font-mono bg-muted px-2 py-1 rounded inline-flex">
              {product.slug}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Description
            </dt>
            <dd className={product.description ? "text-sm" : "text-sm text-muted-foreground"}>
              {product.description || "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              ID
            </dt>
            <dd className="text-xs font-mono text-muted-foreground">{product.id}</dd>
          </div>

          <Separator />

          {/* Metadata timestamps */}
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Created
              </dt>
              <dd className="text-sm">{DATE_FORMAT.format(new Date(product.createdAt))}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Last Updated
              </dt>
              <dd className="text-sm">{DATE_FORMAT.format(new Date(product.updatedAt))}</dd>
            </div>
          </div>
        </dl>
      </section>

      <Separator />

      {/* Images */}
      <section aria-labelledby="images-heading" className="flex flex-col gap-3">
        <h2 id="images-heading" className="font-semibold text-base">
          Images
        </h2>
        <ProductImageGallery images={product.images} />
      </section>

      <Separator />

      {/* Variants */}
      <VariantsSection productId={product.id} />
    </div>
  );
}

function VariantsSection({ productId }: { productId: string }) {
  const { data, isLoading, error } = useVariantsQuery({ productId });

  const variants = data?.data;
  const hasOnlyAutoDefault =
    !isLoading &&
    variants?.length === 1 &&
    variants[0].isDefault &&
    variants[0].sku.startsWith("AUTO-");

  return (
    <section aria-labelledby="variants-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="variants-heading" className="font-semibold text-base">
          Variants
        </h2>
        <CreateVariantModal productId={productId} />
      </div>
      {hasOnlyAutoDefault && (
        <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary/90">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This product has an auto-generated default variant. You can add
            custom variants with specific SKUs and pricing from the management
            section.
          </p>
        </div>
      )}
      <VariantListView
        productId={productId}
        variants={variants}
        isLoading={isLoading}
        error={error}
        renderActions={(variant) => (
          <>
            <EditVariantModal productId={productId} variant={variant} />
            <DeleteVariantAlert productId={productId} variant={variant} />
          </>
        )}
      />
    </section>
  );
}
