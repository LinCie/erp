"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Building2, ArrowRight, Loader2, PlusCircle } from "lucide-react";
import { OrganizationForm } from "@/modules/organizations/presentation/components/organization-form";
import { Button } from "@/shared/presentation/components/ui/button";
import { authClient } from "@/shared/presentation/libraries/auth/auth-client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export function OrganizationDashboard() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data: organizations, isPending: isOrgsPending } =
    authClient.useListOrganizations();

  const handleEnterOrg = async (org: Organization) => {
    await authClient.organization.setActive({
      organizationId: org.id,
    });
    router.replace("/");
  };

  const isLoading = isSessionPending || isOrgsPending;
  const hasOrganizations = organizations && organizations.length > 0;

  const user = session?.user;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Your Organizations
          </h1>
          <p className="text-muted-foreground mt-2">
            Select an organization to enter, or create a new one.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Loading your organizations...
              </p>
            </div>
          ) : !hasOrganizations ? (
            <div className="text-center py-6 px-4 border border-dashed border-border rounded-xl bg-card/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Organizations Yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                You don&apos;t have any organizations. Create one to get
                started, or check your email for invitations to join an existing
                organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setDialogOpen(true)}
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Organization
                </Button>
              </div>
            </div>
          ) : (
            organizations?.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => handleEnterOrg(org)}
                  className="w-full bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">
                        {org.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {org.slug}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        <OrganizationForm open={dialogOpen} onOpenChange={setDialogOpen} />

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">
                {userInitials}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
