"use client";

import { Building2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/presentation/components/ui/sidebar";
import { authClient } from "../../libraries/auth/auth-client";

export function OrgSwitcher() {
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: orgList } = authClient.useListOrganizations();

  const handleExit = async () => {
    await authClient.organization.setActive({ organizationId: null });
    router.push("/organizations");
    router.refresh();
  };

  const orgName = activeOrg?.name || "Select Organization";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{orgName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {orgList?.length || 0} organizations
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-lg"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={handleExit}>
              <LogOut className="mr-2 h-4 w-4" />
              Exit Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
