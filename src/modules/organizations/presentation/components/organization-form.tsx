"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Textarea } from "@/shared/presentation/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/shared/presentation/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/shared/presentation/components/ui/dialog";
import {
  organizationSchema,
  type OrganizationFormValues,
} from "@/modules/organizations/presentation/schemas/organization-schema";
import { authClient } from "@/shared/presentation/libraries/auth/auth-client";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationForm({
  open,
  onOpenChange,
}: OrganizationFormProps) {
  const router = useRouter();
  const hasEditedSlug = useRef(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: {
        street: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    } as OrganizationFormValues,
    validators: {
      onSubmit: organizationSchema,
    },
    onSubmit: async ({ value }) => {
      const metadata: Record<string, unknown> = {};

      if (value.description.trim()) {
        metadata.description = value.description.trim();
      }

      const addressData = {
        street: value.address.street.trim() || undefined,
        street2: value.address.street2.trim() || undefined,
        city: value.address.city.trim() || undefined,
        state: value.address.state.trim() || undefined,
        postalCode: value.address.postalCode.trim() || undefined,
        country: value.address.country.trim() || undefined,
      };

      if (Object.values(addressData).some((v) => v)) {
        metadata.address = addressData;
      }

      const result = await authClient.organization.create({
        name: value.name.trim(),
        slug: value.slug.trim(),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });

      if (result.data) {
        await authClient.organization.setActive({
          organizationId: result.data.id,
        });
        onOpenChange(false);
        router.replace("/");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 py-6 border-dashed">
          <Building2 className="w-4 h-4" /> Create New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <FieldSet>
            <FieldLegend>Basic Information</FieldLegend>
            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>
                      Organization Name *
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        // Auto-generate slug if user hasn't manually edited it
                        if (!hasEditedSlug.current) {
                          form.setFieldValue(
                            "slug",
                            generateSlug(e.target.value),
                          );
                        }
                      }}
                      onBlur={field.handleBlur}
                      placeholder="My Organization"
                      disabled={form.state.isSubmitting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="slug">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        hasEditedSlug.current = true;
                      }}
                      onBlur={field.handleBlur}
                      placeholder="my-organization"
                      disabled={form.state.isSubmitting}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="A brief description of your organization..."
                      disabled={form.state.isSubmitting}
                      rows={3}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Address</FieldLegend>
            <FieldGroup>
              <form.Field name="address.street">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Street Address</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="123 Main Street"
                      disabled={form.state.isSubmitting}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="address.street2">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Street Address 2
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Suite 100"
                      disabled={form.state.isSubmitting}
                    />
                  </Field>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="address.city">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>City</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="San Francisco"
                        disabled={form.state.isSubmitting}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="address.state">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        State / Province
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="California"
                        disabled={form.state.isSubmitting}
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="address.postalCode">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Postal Code</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="94102"
                        disabled={form.state.isSubmitting}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="address.country">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="United States"
                        disabled={form.state.isSubmitting}
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={form.state.isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create & Enter"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
