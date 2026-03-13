"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/presentation/components/ui/breadcrumb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useBreadcrumbs } from "../../hooks/use-breadcrumbs";

export function DashboardBreadcrumbs() {
  const items = useBreadcrumbs();

  if (items.length === 0) return null;

  const parent = items.length > 1 ? items[items.length - 2] : null;
  const current = items[items.length - 1];

  return (
    <Breadcrumb>
      {/* Mobile: back link to parent + current page title for orientation */}
      <BreadcrumbList className="sm:hidden">
        {parent && (
          <BreadcrumbItem>
            <BreadcrumbLink
              href={parent.link}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {parent.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {parent && (
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-[140px] truncate">
            {current.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>

      {/* Desktop: show full breadcrumb trail */}
      <BreadcrumbList className="hidden sm:flex">
        {items.map((item, index) => (
          <Fragment key={item.link}>
            {index !== items.length - 1 && (
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
            {index === items.length - 1 && (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
