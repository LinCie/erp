"use client";

import { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSkuQuery } from "../hooks/use-check-sku-query";

export type VariantFieldValues = {
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency: string;
  isDefault: boolean;
};

type VariantFieldApi = {
  state: { value: VariantFieldValues };
  handleBlur: () => void;
  handleChange: (value: VariantFieldValues) => void;
};

type VariantFormFieldsProps = {
  field: VariantFieldApi;
  index: number;
  disabled?: boolean;
  /**
   * Product ID used to scope the SKU availability check.
   * Required for live SKU uniqueness validation.
   */
  productId?: string;
};

export function VariantFormFields({
  field,
  index,
  disabled,
  productId,
}: VariantFormFieldsProps) {
  const value = field.state.value as VariantFieldValues;

  const handleChange = (
    key: keyof VariantFieldValues,
    newValue: string | number | boolean,
  ) => {
    field.handleChange({ ...value, [key]: newValue } as VariantFieldValues);
  };

  // Local state to track the raw SKU input (for debouncing)
  const [rawSku, setRawSku] = useState(value.sku);
  const debouncedSku = useDebouncedValue(rawSku, 500);

  const skuCheck = useCheckSkuQuery({
    sku: debouncedSku,
    productId: productId ?? "",
    enabled: Boolean(productId) && debouncedSku.length >= 3,
  });

  const skuIsChecking =
    Boolean(productId) &&
    (rawSku !== debouncedSku || (skuCheck.isFetching && !skuCheck.isError));
  const skuTaken =
    Boolean(productId) &&
    !skuIsChecking &&
    skuCheck.data !== undefined &&
    !skuCheck.data.available;

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4">
      <p className="text-sm font-medium text-muted-foreground">
        Variant {index + 1}
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`variant-${index}-sku`}>SKU *</FieldLabel>
          <div className="relative">
            <Input
              id={`variant-${index}-sku`}
              value={value.sku}
              onChange={(e) => {
                const newSku = e.target.value;
                handleChange("sku", newSku);
                setRawSku(newSku);
              }}
              onBlur={field.handleBlur}
              placeholder="PROD-001"
              disabled={disabled}
              className={
                skuTaken
                  ? "border-destructive pr-8 focus-visible:ring-destructive"
                  : productId && skuCheck.data?.available && debouncedSku.length >= 3
                    ? "border-green-500 pr-8 focus-visible:ring-green-500"
                    : "pr-8"
              }
            />
            {/* SKU availability indicator */}
            {productId && value.sku.length >= 3 && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {skuIsChecking ? (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                ) : skuTaken ? (
                  <XCircleIcon className="size-4 text-destructive" />
                ) : skuCheck.data?.available ? (
                  <CheckCircle2Icon className="size-4 text-green-500" />
                ) : null}
              </span>
            )}
          </div>
          <FieldError errors={[]} />
          {skuTaken && (
            <p className="text-sm font-medium text-destructive">
              This SKU is already in use by another variant.
            </p>
          )}
          {productId && skuIsChecking && value.sku.length >= 3 && (
            <p className="text-xs text-muted-foreground">
              Checking availability…
            </p>
          )}
          {productId &&
            !skuIsChecking &&
            skuCheck.data?.available &&
            debouncedSku.length >= 3 && (
              <p className="text-xs text-green-600">SKU is available.</p>
            )}
        </Field>

        <Field>
          <FieldLabel htmlFor={`variant-${index}-basePrice`}>
            Base Price *
          </FieldLabel>
          <Input
            id={`variant-${index}-basePrice`}
            type="number"
            min={0}
            step="0.01"
            value={value.basePrice}
            onChange={(e) =>
              handleChange("basePrice", parseFloat(e.target.value) || 0)
            }
            onBlur={field.handleBlur}
            placeholder="0.00"
            disabled={disabled}
          />
          <FieldError errors={[]} />
        </Field>

        <Field>
          <FieldLabel htmlFor={`variant-${index}-salePrice`}>
            Sale Price
          </FieldLabel>
          <Input
            id={`variant-${index}-salePrice`}
            type="number"
            min={0}
            step="0.01"
            value={value.salePrice ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              handleChange("salePrice", v === "" ? 0 : parseFloat(v) || 0);
            }}
            onBlur={field.handleBlur}
            placeholder="0.00 (optional)"
            disabled={disabled}
          />
        </Field>

        <div className="flex items-center gap-2">
          <input
            id={`variant-${index}-isDefault`}
            type="checkbox"
            checked={value.isDefault}
            onChange={(e) => handleChange("isDefault", e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor={`variant-${index}-isDefault`}>Default variant</Label>
        </div>
      </FieldGroup>
    </div>
  );
}
