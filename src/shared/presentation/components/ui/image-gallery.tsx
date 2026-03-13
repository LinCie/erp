"use client";

import * as React from "react";
import { useState, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Pencil, X, Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../libraries/utils";
import { Button } from "./button";
import { api } from "../../libraries/api-client";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

type ImageGalleryProps = {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  onRemove?: (image: ProductImage) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageGallery({
  images,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageGalleryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
  const loadedKeysRef = useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const loadUrls = async () => {
      const keysToLoad = images
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
  }, [images]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reordered = items.map((img, index) => ({ ...img, order: index }));
    onChange(reordered);
  };

  const handleRemove = (index: number) => {
    const image = images[index];
    if (!image) return;

    const newImages = images.filter((_, i) => i !== index);
    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reordered);
    onRemove?.(image);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditValue(images[index]?.alt ?? "");
  };

  const handleEditSave = (index: number) => {
    if (editValue.trim()) {
      const newImages = [...images];
      const currentImage = newImages[index];
      if (currentImage) {
        newImages[index] = { ...currentImage, alt: editValue.trim() };
        onChange(newImages);
      }
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="image-gallery" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
              className,
            )}
          >
            <AnimatePresence mode="popLayout">
              {images.map((image, index) => (
                <Draggable
                  key={image.key}
                  draggableId={image.key}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "relative group aspect-square rounded-lg overflow-hidden border bg-muted",
                        snapshot.isDragging &&
                          "shadow-lg ring-2 ring-primary z-50",
                        disabled && "opacity-60",
                      )}
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

                      {!disabled && (
                        <>
                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-2 left-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemove(index)}
                            aria-label={`Remove ${image.alt}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>

                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingIndex === index ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleEditSave(index);
                                    if (e.key === "Escape") handleEditCancel();
                                  }}
                                  className="flex-1 text-xs px-2 py-1 rounded bg-white/90 text-black"
                                  autoFocus
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 bg-white/90"
                                  onClick={() => handleEditSave(index)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs text-white truncate flex-1">
                                  {image.alt}
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 shrink-0"
                                  onClick={() => handleEditStart(index)}
                                >
                                  <Pencil className="h-3 w-3 text-white" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
