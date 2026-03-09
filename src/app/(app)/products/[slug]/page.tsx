import { ProductView } from "@/modules/products/presentation/components/product-view";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <ProductView slug={resolvedParams.slug} />;
}
