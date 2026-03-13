"use client";

import { useState } from "react";
import { api } from "../libraries/api-client";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";
import type { StorageModule } from "@/shared/application/constants/storage-modules";

type UploadProgress = {
  file: File;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
  error?: string;
  result?: ProductImage;
};

type UseImageUploadOptions = {
  module: StorageModule;
  onSuccess?: (images: ProductImage[]) => void;
  onError?: (errors: string[]) => void;
};

export function useImageUpload({
  module,
  onSuccess,
  onError,
}: UseImageUploadOptions) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (files: File[]): Promise<ProductImage[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    const newUploads: UploadProgress[] = files.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }));
    setUploads(newUploads);

    const results: ProductImage[] = [];
    const errors: string[] = [];

    await Promise.all(
      files.map(async (file, index) => {
        try {
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, status: "uploading" } : u,
            ),
          );

          const { data: presignData, error: presignError } =
            await api.storage.presign.post({
              module,
              filename: file.name,
              contentType: file.type,
            });

          if (presignError || !presignData) {
            throw new Error("Failed to get upload URL");
          }

          const uploadResponse = await fetch(presignData.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, status: "complete", progress: 100 } : u,
            ),
          );

          const productImage: ProductImage = {
            key: presignData.key,
            alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            order: results.length,
          };

          results.push(productImage);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, status: "error", error: errorMessage } : u,
            ),
          );
          errors.push(`${file.name}: ${errorMessage}`);
        }
      }),
    );

    setIsUploading(false);

    if (errors.length > 0 && onError) {
      onError(errors);
    }

    if (results.length > 0 && onSuccess) {
      onSuccess(results);
    }

    return results;
  };

  const clearUploads = () => {
    setUploads([]);
  };

  return {
    uploads,
    isUploading,
    uploadFiles,
    clearUploads,
  };
}
