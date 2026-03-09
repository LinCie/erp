"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";

type BreadcrumbItem = {
  title: string;
  link: string;
};

class BreadcrumbStore {
  private overrides: Record<string, string> = {};
  private listeners: Set<() => void> = new Set();

  setOverride(path: string, title: string) {
    if (this.overrides[path] !== title) {
      this.overrides = { ...this.overrides, [path]: title };
      this.notify();
    }
  }

  removeOverride(path: string) {
    if (path in this.overrides) {
      const newOverrides = { ...this.overrides };
      delete newOverrides[path];
      this.overrides = newOverrides;
      this.notify();
    }
  }

  getOverrides = () => this.overrides;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const breadcrumbStore = new BreadcrumbStore();

export function useBreadcrumbOverride(path: string, title?: string) {
  useEffect(() => {
    if (title) {
      breadcrumbStore.setOverride(path, title);
      return () => breadcrumbStore.removeOverride(path);
    }
  }, [path, title]);
}

const routeMapping: Record<string, BreadcrumbItem[]> = {
  "/": [{ title: "Dashboard", link: "/" }],
  "/products": [
    { title: "Dashboard", link: "/" },
    { title: "Products", link: "/products" },
  ],
  "/products/categories": [
    { title: "Dashboard", link: "/" },
    { title: "Products", link: "/products" },
    { title: "Categories", link: "/products/categories" },
  ],
  "/products/inventory": [
    { title: "Dashboard", link: "/" },
    { title: "Products", link: "/products" },
    { title: "Inventory", link: "/products/inventory" },
  ],
  "/products/new": [
    { title: "Dashboard", link: "/" },
    { title: "Products", link: "/products" },
    { title: "Create New", link: "/products/new" },
  ],
  "/orders": [
    { title: "Dashboard", link: "/" },
    { title: "Orders", link: "/orders" },
  ],
  "/orders/pending": [
    { title: "Dashboard", link: "/" },
    { title: "Orders", link: "/orders" },
    { title: "Pending", link: "/orders/pending" },
  ],
  "/orders/completed": [
    { title: "Dashboard", link: "/" },
    { title: "Orders", link: "/orders" },
    { title: "Completed", link: "/orders/completed" },
  ],
  "/orders/new": [
    { title: "Dashboard", link: "/" },
    { title: "Orders", link: "/orders" },
    { title: "Create New", link: "/orders/new" },
  ],
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const overrides = useSyncExternalStore(
    breadcrumbStore.subscribe,
    breadcrumbStore.getOverrides,
    breadcrumbStore.getOverrides,
  );

  const breadcrumbs = useMemo(() => {
    const applyOverrides = (items: BreadcrumbItem[]) => {
      return items.map((item) => ({
        ...item,
        title: overrides[item.link] || item.title,
      }));
    };

    if (routeMapping[pathname]) {
      return applyOverrides(routeMapping[pathname]);
    }

    const segments = pathname.split("/").filter(Boolean);
    const generated = segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      };
    });

    return applyOverrides(generated);
  }, [pathname, overrides]);

  return breadcrumbs;
}
