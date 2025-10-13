"use client";

import * as React from "react";
import Sidebar from "@/components/admin/Sidebar";
import { AdminTopbar } from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-dvh">
      <AdminTopbar onToggle={() => setOpen((s) => !s)} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[18rem_1fr]">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
