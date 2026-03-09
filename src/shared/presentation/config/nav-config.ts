import { LayoutDashboard, Package, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: false,
    items: [],
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    isActive: false,
    items: [
      {
        title: "Products",
        url: "/products",
      },
    ],
  },
];
