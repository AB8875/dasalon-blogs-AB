import { LayoutDashboard, FileText, Tags, Users, Settings } from "lucide-react";

export const sidebarLinks: {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText, badge: "3" },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
