// path: src/components/admin/Topbar.tsx
"use client";

import * as React from "react";
import { Menu } from "lucide-react";

export function AdminTopbar({ onToggle }: { onToggle?: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={() => onToggle?.()}
            className="md:hidden rounded p-2 hover:bg-slate-100"
          >
            <Menu />
          </button>
          <h1 className="text-lg font-semibold md:block">Admin Panel</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="rounded p-2 hover:bg-slate-100"
          >
            🔔
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 rounded p-1 hover:bg-slate-100">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <span className="hidden md:inline">Abhishek</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
