"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";

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
};

export function VariantFormFields({
  field,
  index,
  disabled,
}: VariantFormFieldsProps) {
  const value = field.state.value as VariantFieldValues;

  const handleChange = (
    key: keyof VariantFieldValues,
    newValue: string | number | boolean,
  ) => {
    field.handleChange({ ...value, [key]: newValue } as VariantFieldValues);
  };

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4">
      <p className="text-sm font-medium text-muted-foreground">
        Variant {index + 1}
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`variant-${index}-sku`}>SKU *</FieldLabel>
          <Input
            id={`variant-${index}-sku`}
            value={value.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            onBlur={field.handleBlur}
            placeholder="PROD-001"
            disabled={disabled}
          />
          <FieldError errors={[]} />
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
