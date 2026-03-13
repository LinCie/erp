"use client";

import { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import { Switch } from "@/shared/presentation/components/ui/switch";
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSkuQuery } from "../hooks/use-check-sku-query";

export type VariantFieldValues = {
  name: string;
  sku: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  currency: string;
  isDefault: boolean;
};

type VariantFieldApi = {
  state: { value: VariantFieldValues; meta: { errors: unknown[] } };
  handleBlur: () => void;
  handleChange: (value: VariantFieldValues) => void;
};

type VariantFormFieldsProps = {
  field: VariantFieldApi;
  index: number;
  disabled?: boolean;
  productId?: string;
  excludeId?: string;
};

export function VariantFormFields({
  field,
  index,
  disabled,
  productId,
  excludeId,
}: VariantFormFieldsProps) {
  const value = field.state.value as VariantFieldValues;

  const handleChange = (
    key: keyof VariantFieldValues,
    newValue: string | number | boolean | undefined,
  ) => {
    field.handleChange({ ...value, [key]: newValue } as VariantFieldValues);
  };

  const [rawSku, setRawSku] = useState(value.sku);
  const debouncedSku = useDebouncedValue(rawSku, 500);

  const skuCheck = useCheckSkuQuery({
    sku: debouncedSku,
    excludeId,
    productId: productId ?? "",
    enabled:
      Boolean(productId) &&
      debouncedSku.length >= 3 &&
      (excludeId ? debouncedSku !== value.sku : true),
  });

  const skuIsChecking =
    Boolean(productId) &&
    (rawSku !== debouncedSku || (skuCheck.isFetching && !skuCheck.isError));

  const skuUnchanged = Boolean(excludeId) && rawSku === value.sku;
  const skuTaken =
    Boolean(productId) &&
    !skuUnchanged &&
    !skuIsChecking &&
    skuCheck.data !== undefined &&
    !skuCheck.data.available;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-muted-foreground">
        Variant {index + 1}
      </p>

      <FieldSet>
        <FieldGroup>
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={`variant-${index}-name`}>Name *</FieldLabel>
            <Input
              id={`variant-${index}-name`}
              value={value.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={field.handleBlur}
              placeholder="e.g., Small / Red"
              disabled={disabled}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={[]} />
          </Field>

          <Field data-invalid={skuTaken}>
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
                aria-invalid={skuTaken}
                className={
                  skuTaken
                    ? "border-destructive pr-8 focus-visible:ring-destructive"
                    : !skuUnchanged && skuCheck.data?.available
                      ? "border-success pr-8 focus-visible:ring-success"
                      : "pr-8"
                }
              />
              {!skuUnchanged && value.sku.length >= 3 && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2" aria-hidden="true">
                  {skuIsChecking ? (
                    <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                  ) : skuTaken ? (
                    <XCircleIcon className="size-4 text-destructive" />
                  ) : skuCheck.data?.available ? (
                    <CheckCircle2Icon className="size-4 text-success" />
                  ) : null}
                </span>
              )}
            </div>
            <FieldError errors={[]} />
            <div aria-live="polite" aria-atomic="true">
              {skuTaken && (
                <p className="text-sm font-medium text-destructive">
                  This SKU is already in use by another variant.
                </p>
              )}
              {!skuUnchanged && skuIsChecking && value.sku.length >= 3 && (
                <p className="text-xs text-muted-foreground">
                  Checking availability…
                </p>
              )}
              {!skuUnchanged &&
                !skuIsChecking &&
                skuCheck.data?.available &&
                value.sku.length >= 3 && (
                  <p className="text-xs text-success">SKU is available.</p>
                )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Pricing
        </FieldLegend>
        <div className="rounded-lg border bg-muted/30 p-3">
          <FieldGroup>
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
                  handleChange("salePrice", v === "" ? undefined : parseFloat(v) || undefined);
                }}
                onBlur={field.handleBlur}
                placeholder="0.00 (optional)"
                disabled={disabled}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`variant-${index}-costPrice`}>
                Cost Price
              </FieldLabel>
              <Input
                id={`variant-${index}-costPrice`}
                type="number"
                min={0}
                step="0.01"
                value={value.costPrice ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  handleChange("costPrice", v === "" ? undefined : parseFloat(v) || undefined);
                }}
                onBlur={field.handleBlur}
                placeholder="0.00 (optional)"
                disabled={disabled}
              />
            </Field>
          </FieldGroup>
        </div>
      </FieldSet>

      <div className="flex items-center gap-2">
        <Switch
          id={`variant-${index}-isDefault`}
          checked={value.isDefault}
          onCheckedChange={(checked) => handleChange("isDefault", checked)}
          disabled={disabled}
          size="sm"
        />
        <Label htmlFor={`variant-${index}-isDefault`}>Default variant</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        The default variant is shown first in listings.
      </p>
    </div>
  );
}
