"use client";

import { api } from "../libraries/api-client";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type UseImageCleanupOptions = {
  onSuccess?: (images: ProductImage[]) => void;
  onError?: (errors: string[]) => void;
};

export function useImageCleanup(options?: UseImageCleanupOptions) {
  const cleanupImages = async (images: ProductImage[]): Promise<void> => {
    if (images.length === 0) return;

    const results = await Promise.allSettled(
      images.map(async (img) => {
        const { error } = await api.storage.delete({ key: img.key });
        if (error) throw new Error(`Failed to delete ${img.alt}`);
      }),
    );

    const errors: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        errors.push(`${images[index]?.alt}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      options?.onError?.(errors);
    } else {
      options?.onSuccess?.(images);
    }
  };

  const cleanupNewImages = async (
    currentImages: ProductImage[],
    originalKeys: Set<string>,
  ): Promise<void> => {
    const newUploads = currentImages.filter(
      (img) => !originalKeys.has(img.key),
    );
    await cleanupImages(newUploads);
  };

  return { cleanupImages, cleanupNewImages };
}
