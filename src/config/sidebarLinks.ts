import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  Settings,
} from "lucide-react";

export const sidebarLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];
