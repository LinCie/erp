"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Plus } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { Textarea } from "@/shared/presentation/components/ui/textarea";
import {
  createProductSchema,
  type CreateProductFormValues,
  productSlugSchema,
} from "../schemas/create-product-schema";
import { useCreateProductMutation } from "../hooks/use-create-product-mutation";
import { api } from "@/shared/presentation/libraries/api-client";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function checkSlugAvailability(slug: string, signal: AbortSignal) {
  const response = await api.products["check-slug"]({ slug }).get({
    fetch: {
      signal,
    },
  });

  if (response.error) {
    throw new Error("Could not validate slug. Please try again.");
  }

  return response.data.isAvailable;
}

export function CreateProductModal() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createProductMutation = useCreateProductMutation();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    } as CreateProductFormValues,
    validators: {
      onSubmit: createProductSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await createProductMutation.mutateAsync(value);
        form.reset();
        setOpen(false);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Could not create product. Please try again.",
        );
      }
    },
  });

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
        <Button>
          <Plus data-icon="inline-start" />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a product to the active organization.
          </DialogDescription>
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
                      disabled={createProductMutation.isPending}
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
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value, signal }) => {
                    const slug = value.trim();

                    if (!productSlugSchema.safeParse(slug).success) {
                      return undefined;
                    }

                    const isAvailable = await checkSlugAvailability(
                      slug,
                      signal,
                    );

                    return isAvailable ? undefined : "Slug is already taken";
                  },
                }}
              >
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
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
                      disabled={createProductMutation.isPending}
                    />
                    {field.state.meta.isValidating ? (
                      <FieldDescription>
                        Checking slug availability...
                      </FieldDescription>
                    ) : null}
                    <FieldError errors={field.state.meta.errors} />
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
                      disabled={createProductMutation.isPending}
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
                createProductMutation.isPending || form.state.isValidating
              }
            >
              {createProductMutation.isPending || form.state.isValidating ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              Create Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
