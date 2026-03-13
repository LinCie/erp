"use client";

import * as React from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "../../libraries/utils";
import { Button } from "./button";
import { ImageGallery } from "./image-gallery";
import { useImageUpload } from "../../hooks/use-image-upload";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";
import type { StorageModule } from "@/shared/application/constants/storage-modules";

type ImageGalleryUploaderProps = {
  module: StorageModule;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

const typedStorageApi = {
  delete: async (key: string): Promise<{ success: boolean; error?: string }> => {
    const { api } = await import("../../libraries/api-client");
    const storage = api.storage as unknown as {
      delete: (body: { key: string }) => Promise<{ error?: unknown }>;
    };
    const { error } = await storage.delete({ key });
    return { success: !error, error: error ? String(error) : undefined };
  },
};

export function ImageGalleryUploader({
  module,
  images,
  onChange,
  maxFiles = 10,
  maxSize = 4,
  accept = "image/*",
  disabled = false,
  className,
}: ImageGalleryUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const { uploadFiles, isUploading, uploads } = useImageUpload({
    module,
    onSuccess: (newImages) => {
      const reorderedNew = newImages.map((img, i) => ({
        ...img,
        order: images.length + i,
      }));
      onChange([...images, ...reorderedNew].slice(0, maxFiles));
    },
    onError: (errors) => {
      errors.forEach((error) => toast.error(error));
    },
  });

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    const remainingSlots = maxFiles - images.length;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles = filesArray.slice(0, remainingSlots).filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    uploadFiles(validFiles);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) handleFileChange(e.dataTransfer.files);
  };

  const handleRemove = async (image: ProductImage): Promise<boolean> => {
    try {
      const result = await typedStorageApi.delete(image.key);
      if (!result.success) {
        toast.error(`Failed to remove ${image.alt} from storage`);
        return false;
      }
      return true;
    } catch {
      toast.error(`Failed to remove ${image.alt} from storage`);
      return false;
    }
  };

  const hasErrors = uploads.some((u) => u.status === "error");
  const remainingSlots = maxFiles - images.length;

  return (
    <div className={cn("space-y-4", className)}>
      {remainingSlots > 0 && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 bg-transparent",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          aria-label="Image uploader dropzone"
          tabIndex={disabled ? -1 : 0}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </Button>
            <div>
              <p className="font-medium text-sm">
                {isUploading
                  ? `Uploading ${uploads.filter((u) => u.status === "uploading").length} image(s)...`
                  : "Drop images or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                {remainingSlots} of {maxFiles} slots remaining. Max {maxSize}MB each.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasErrors && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            Some uploads failed. Please try again.
          </p>
        </div>
      )}

      <ImageGallery
        images={images}
        onChange={onChange}
        onRemove={handleRemove}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
