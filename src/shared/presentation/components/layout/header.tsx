"use client";

import { SidebarTrigger } from "@/shared/presentation/components/ui/sidebar";
import { Separator } from "@/shared/presentation/components/ui/separator";
import { DashboardBreadcrumbs } from "./breadcrumbs";
import { ModeToggle } from "./mode-toggle";
import { NavUser } from "./nav-user";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DashboardBreadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <div className="hidden md:block">
          <NavUser />
        </div>
      </div>
    </header>
  );
}
