"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { Loader2, Pencil, Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/presentation/components/ui/dialog";
import { DropdownMenuItem } from "@/shared/presentation/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Textarea } from "@/shared/presentation/components/ui/textarea";
import {
  productFormSchema,
  type ProductFormValues,
  productSlugSchema,
} from "../schemas/create-product-schema";
import { useUpdateProductMutation } from "../hooks/use-update-product-mutation";
import type { ProductEntity } from "../../domain/product.entity";
import { generateSlug } from "../utils/product.utils";
import { useDebouncedValue } from "@/shared/presentation/hooks/use-debounced-value";
import { useCheckSlugQuery } from "../hooks/use-check-slug-query";

type EditProductModalProps = {
  product: ProductEntity;
  children?: React.ReactNode;
};

export function EditProductModal({ product, children }: EditProductModalProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateProductMutation = useUpdateProductMutation();

  const form = useForm({
    defaultValues: {
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
    } as ProductFormValues,
    validators: {
      onSubmit: productFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...value,
        });
        setOpen(false);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Could not update product. Please try again.",
        );
      }
    },
  });

  const rawSlug = useStore(form.store, (state) => state.values.slug);
  const debouncedSlug = useDebouncedValue(rawSlug, 500);

  const slugCheck = useCheckSlugQuery({
    slug: debouncedSlug,
    excludeId: product.id,
    enabled: debouncedSlug.length >= 3,
  });

  const slugIsChecking =
    rawSlug !== debouncedSlug || (slugCheck.isFetching && !slugCheck.isError);
  const slugTaken =
    !slugIsChecking && slugCheck.data !== undefined && !slugCheck.data.available;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSubmitError(null);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            className="group w-full cursor-pointer font-medium"
          >
            <Pencil className="mr-2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            Edit
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <FieldSet>
            <FieldLegend>Product Details</FieldLegend>
            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        const previousGeneratedSlug = generateSlug(
                          field.state.value,
                        );
                        const currentSlug = form.getFieldValue("slug");

                        field.handleChange(nextValue);

                        if (
                          !currentSlug ||
                          currentSlug === previousGeneratedSlug
                        ) {
                          form.setFieldValue("slug", generateSlug(nextValue));
                        }
                      }}
                      aria-invalid={field.state.meta.errors.length > 0}
                      placeholder="Premium Laptop"
                      disabled={updateProductMutation.isPending}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="slug"
                validators={{
                  onChange: ({ value }) => {
                    const result = productSlugSchema.safeParse(value.trim());
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          field.handleChange(event.target.value);
                        }}
                        aria-invalid={field.state.meta.errors.length > 0}
                        placeholder="premium-laptop"
                        disabled={updateProductMutation.isPending}
                        className={
                          slugTaken
                            ? "border-destructive pr-8 focus-visible:ring-destructive"
                            : slugCheck.data?.available
                              ? "border-green-500 pr-8 focus-visible:ring-green-500"
                              : "pr-8"
                        }
                      />
                      {field.state.value.length >= 3 && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {slugIsChecking ? (
                            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                          ) : slugTaken ? (
                            <XCircleIcon className="size-4 text-destructive" />
                          ) : slugCheck.data?.available ? (
                            <CheckCircle2Icon className="size-4 text-green-500" />
                          ) : null}
                        </span>
                      )}
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                    {slugTaken && !field.state.meta.errors.length && (
                      <p className="text-sm font-medium text-destructive">
                        This slug is already in use by another product.
                      </p>
                    )}
                    {slugIsChecking && field.state.value.length >= 3 && (
                      <p className="text-xs text-muted-foreground">
                        Checking availability…
                      </p>
                    )}
                    {!slugIsChecking &&
                      slugCheck.data?.available &&
                      field.state.value.length >= 3 && (
                        <p className="text-xs text-green-600">Slug is available.</p>
                      )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={field.state.meta.errors.length > 0}
                      placeholder="Short description for internal catalog and sales context."
                      disabled={updateProductMutation.isPending}
                      rows={4}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={
                updateProductMutation.isPending || slugTaken || slugIsChecking
              }
            >
              {updateProductMutation.isPending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
