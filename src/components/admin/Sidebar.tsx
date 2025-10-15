// path: src/components/admin/Sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
type AdminSidebarProps = {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
};

import {
  LayoutDashboard,
  FileText,
  Tags,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  badge?: string;
  icon: React.ReactNode;
  action?: () => void;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Posts",
    href: "/admin/posts",
    icon: <FileText size={18} />,
    badge: "3",
  },
  { label: "Categories", href: "/admin/categories", icon: <Tags size={18} /> },
  { label: "Users", href: "/admin/users", icon: <Users size={18} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  { label: "Logout", href: "/logout", icon: <LogOut size={18} /> },
];

export default function ZxSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r p-4 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Admin Sidebar"
      >
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin">
            <span className="text-lg font-semibold">Dasalon Admin</span>
          </Link>
          <button
            aria-label="Close sidebar"
            className="md:hidden rounded p-1 hover:bg-slate-100"
            onClick={() => onClose?.()}
          >
            ✕
          </button>
        </div>

        <nav aria-label="Main nav" className="flex flex-col gap-1">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href ?? "#"}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  <span className="inline-flex items-center">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Spacer for content on md+ */}
      <div className="hidden md:block md:w-64" />
    </>
  );
}
