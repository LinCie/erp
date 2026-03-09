"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/presentation/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { OrgSwitcher } from "./org-switcher";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
