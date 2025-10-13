"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { ADMIN_NAV } from "@/constants/admin-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle navigation"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold">Admin Panel</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl">
            <label className="sr-only" htmlFor="admin-search">
              Search
            </label>
            <Input id="admin-search" placeholder="Search…" className="w-full" />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <nav className="md:hidden border-t">
          <ul className="grid grid-cols-2 gap-1 p-2">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
