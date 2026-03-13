"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, ImageIcon } from "lucide-react";

import { cn } from "@/shared/presentation/libraries/utils";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/shared/presentation/components/ui/dialog";
import { api } from "@/shared/presentation/libraries/api-client";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type ProductImageGalleryProps = {
  images: ProductImage[];
  className?: string;
};

export function ProductImageGallery({
  images,
  className,
}: ProductImageGalleryProps) {
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const loadedKeysRef = useRef<Set<string>>(new Set());

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const loadUrls = async () => {
      const keysToLoad = sortedImages
        .map((img) => img.key)
        .filter((key) => !loadedKeysRef.current.has(key));

      if (keysToLoad.length === 0) return;

      keysToLoad.forEach((key) => loadedKeysRef.current.add(key));
      setLoadingUrls((prev) => {
        const next = new Set(prev);
        keysToLoad.forEach((key) => next.add(key));
        return next;
      });

      await Promise.allSettled(
        keysToLoad.map(async (key) => {
          try {
            const { data } = await api.storage["presign-download"].post({
              key,
            });

            if (data?.downloadUrl) {
              setImageUrls((prev) => new Map(prev).set(key, data.downloadUrl));
            }
          } catch {
          } finally {
            setLoadingUrls((prev) => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          }
        }),
      );
    };

    loadUrls();
  }, [sortedImages]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev > 0 ? prev - 1 : sortedImages.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev < sortedImages.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, sortedImages.length]);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePrev = () => {
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : sortedImages.length - 1
    );
  };

  const handleNext = () => {
    setLightboxIndex((prev) =>
      prev < sortedImages.length - 1 ? prev + 1 : 0
    );
  };

  if (sortedImages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 border rounded-lg bg-muted/30",
          className
        )}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No images uploaded</p>
      </div>
    );
  }

  const currentImage = sortedImages[lightboxIndex];

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
          className
        )}
      >
        {sortedImages.map((image, index) => (
          <button
            key={image.key}
            type="button"
            onClick={() => handleImageClick(index)}
            className="relative group aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {loadingUrls.has(image.key) ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : imageUrls.has(image.key) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrls.get(image.key)}
                alt={image.alt}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs text-center p-2">
                {image.alt}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-4xl p-0 bg-black/90 border-transparent"
          showCloseButton={false}
        >
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[80vh]">
            {currentImage && (
              <>
                {loadingUrls.has(currentImage.key) ||
                !imageUrls.has(currentImage.key) ? (
                  <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrls.get(currentImage.key)}
                    alt={currentImage.alt}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={handlePrev}
                  disabled={sortedImages.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleNext}
                  disabled={sortedImages.length <= 1}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                  {lightboxIndex + 1} / {sortedImages.length}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setLightboxOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  ×
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
