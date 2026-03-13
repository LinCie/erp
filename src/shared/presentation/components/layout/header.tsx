"use client";

import { SidebarTrigger } from "@/shared/presentation/components/ui/sidebar";
import { Separator } from "@/shared/presentation/components/ui/separator";
import { DashboardBreadcrumbs } from "./breadcrumbs";
import { ModeToggle } from "./mode-toggle";
import { NavUserCompact } from "./nav-user";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DashboardBreadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        {/* Compact avatar — mobile only (desktop uses sidebar footer NavUser) */}
        <div className="md:hidden">
          <NavUserCompact />
        </div>
      </div>
    </header>
  );
}
