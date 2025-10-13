// path: src/components/admin/AdminSidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";

type AdminSidebarProps = {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
};

type NavItem = {
  label: string;
  href?: string;
  badge?: string;
  action?: () => void;
  // icon placeholder only; render comment in JSX where appropriate
  iconName?: string; // lucide-react icon name comment usage
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", iconName: "LayoutDashboard" },
  { label: "Posts", href: "/admin/posts", iconName: "FileText", badge: "3" }, // drafts count example
  { label: "Categories", href: "/admin/categories", iconName: "Tags" },
  { label: "Users", href: "/admin/users", iconName: "Users" },
  { label: "Settings", href: "/admin/settings", iconName: "Settings" },
  { label: "Logout", href: "/logout", iconName: "LogOut" },
];

const itemBase =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background";

export default function AdminSidebar({
  collapsed = false,
  onCollapseToggle,
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const renderItem = (item: NavItem, idx: number) => {
    const content = (
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            {/* Icon: {item.iconName} */}
            <span className="sr-only">{item.label} icon</span>
          </span>
          <span className={collapsed ? "hidden md:inline" : ""}>
            {item.label}
          </span>
        </div>
        {item.badge && (
          <span
            className={
              "ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-xs font-semibold text-secondary-foreground"
            }
            aria-label={`${item.label} badge`}
          >
            {item.badge}
          </span>
        )}
      </div>
    );

    const className =
      itemBase + (collapsed ? " justify-center md:justify-start" : "");

    if (item.href) {
      return (
        <li key={idx} className="w-full">
          <Link href={item.href} className={className} aria-label={item.label}>
            {content}
          </Link>
        </li>
      );
    }
    return (
      <li key={idx} className="w-full">
        <button
          type="button"
          className={className}
          aria-label={item.label}
          onClick={item.action}
        >
          {content}
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={[
          "hidden md:flex md:flex-col md:justify-between md:border-r md:border-border md:bg-card md:text-card-foreground",
          "md:py-4",
          collapsed ? "md:w-16" : "md:w-64",
          "md:rounded-none",
          "md:shadow-sm",
        ].join(" ")}
        aria-label="Admin Sidebar"
        role="navigation"
      >
        <div className="px-3">
          <div className="mb-3 flex items-center justify-between">
            <div
              className={[
                "h-10 rounded-lg bg-muted",
                "flex items-center justify-center",
                collapsed ? "w-10" : "w-full",
              ].join(" ")}
              aria-label="Brand"
            >
              {/* Icon: Shield */}
              <span className="sr-only">Brand</span>
              {!collapsed && (
                <span className="text-sm font-semibold text-muted-foreground">
                  Admin
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
              onClick={onCollapseToggle}
              aria-expanded={!collapsed}
            >
              {/* Icon: PanelLeftClose / PanelLeftOpen */}
              <span className="sr-only">Toggle sidebar</span>
            </button>
          </div>

          <nav className="mt-2">
            <ul className="flex flex-col gap-1">{NAV_ITEMS.map(renderItem)}</ul>
          </nav>
        </div>

        <div className="mt-4 px-3">
          {!collapsed && (
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              {/* Optional promo or usage info */}
              Quick tip: Use the toggle to collapse the sidebar.
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="md:hidden p-2">
        <button
          type="button"
          aria-label="Open admin menu"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-sheet"
        >
          {/* Icon: Menu */}
          Menu
        </button>
      </div>

      {/* Mobile Top Sheet / Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin Sidebar Mobile"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="admin-mobile-sheet"
            className="absolute inset-x-0 top-0 rounded-b-2xl border-b border-border bg-card p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Icon: Shield */}
                <span className="text-sm font-semibold text-card-foreground">
                  Admin
                </span>
              </div>
              <button
                type="button"
                aria-label="Close admin menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
                onClick={() => setMobileOpen(false)}
              >
                {/* Icon: X */}
                <span className="sr-only">Close</span>
              </button>
            </div>

            <nav className="max-h-[75vh] overflow-y-auto">
              <ul
                className="flex flex-col gap-1"
                onClick={() => setMobileOpen(false)}
              >
                {NAV_ITEMS.map(renderItem)}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
