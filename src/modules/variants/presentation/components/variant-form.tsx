"use client";

import { useImperativeHandle, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import { ImageGalleryUploader } from "@/shared/presentation/components/ui/image-gallery-uploader";
import {
  VariantFormFields,
  type VariantFieldValues,
} from "./variant-form-fields";
import { useImageCleanup } from "@/shared/presentation/hooks/use-image-cleanup";
import type { ProductImage } from "@/modules/products/domain/product-image.entity";

export type VariantFormValues = VariantFieldValues & {
  images: ProductImage[];
};

export type VariantFormRef = {
  cleanupUnsavedImages: (originalKeys?: Set<string>) => Promise<ProductImage[]>;
  reset: () => void;
};

type VariantFormProps = {
  productId: string;
  onSubmit: (value: VariantFormValues) => Promise<void>;
  isPending?: boolean;
  submitLabel?: ReactNode;
  ref?: React.RefObject<VariantFormRef | null>;
  initialValues?: VariantFormValues;
  excludeId?: string;
  showImages?: boolean;
};

const DEFAULT_VALUES: VariantFormValues = {
  name: "",
  sku: "",
  basePrice: 0,
  salePrice: undefined,
  costPrice: undefined,
  currency: "USD",
  isDefault: false,
  images: [],
};

export function VariantForm({
  productId,
  onSubmit,
  isPending,
  submitLabel = "Create",
  ref,
  initialValues,
  excludeId,
  showImages = true,
}: VariantFormProps) {
  const form = useForm({
    defaultValues: initialValues ?? DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const { cleanupImages } = useImageCleanup();

  useImperativeHandle(
    ref,
    () => ({
      cleanupUnsavedImages: async (originalKeys?: Set<string>) => {
        const currentImages =
          (form.getFieldValue("images") as ProductImage[] | undefined) ?? [];
        if (originalKeys) {
          await cleanupImages(
            currentImages.filter((img) => !originalKeys.has(img.key)),
          );
        } else {
          await cleanupImages(currentImages);
        }
        return currentImages;
      },
      reset: () => form.reset(),
    }),
    [form, cleanupImages],
  );

  const getVariantFieldValue = (): VariantFieldValues => ({
    name: form.getFieldValue("name") as string,
    sku: form.getFieldValue("sku") as string,
    basePrice: form.getFieldValue("basePrice") as number,
    salePrice: form.getFieldValue("salePrice") as number | undefined,
    costPrice: form.getFieldValue("costPrice") as number | undefined,
    currency: form.getFieldValue("currency") as string,
    isDefault: form.getFieldValue("isDefault") as boolean,
  });

  const handleVariantFieldChange = (newValue: VariantFieldValues) => {
    form.setFieldValue("name", newValue.name);
    form.setFieldValue("sku", newValue.sku);
    form.setFieldValue("basePrice", newValue.basePrice);
    form.setFieldValue("salePrice", newValue.salePrice);
    form.setFieldValue("costPrice", newValue.costPrice);
    form.setFieldValue("currency", newValue.currency);
    form.setFieldValue("isDefault", newValue.isDefault);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6 px-6 pb-4"
    >
      <VariantFormFields
        field={{
          state: {
            value: getVariantFieldValue(),
            meta: { errors: [] },
          },
          handleBlur: () => {},
          handleChange: handleVariantFieldChange,
        }}
        index={0}
        disabled={isPending}
        productId={productId}
        excludeId={excludeId}
      />

      {showImages && (
        <FieldSet>
          <FieldLegend>Images</FieldLegend>
          <form.Field name="images">
            {(field) => (
              <ImageGalleryUploader
                module="products"
                images={field.state.value}
                onChange={(images) => field.handleChange(images)}
                disabled={isPending}
                maxFiles={10}
              />
            )}
          </form.Field>
        </FieldSet>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              {submitLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
