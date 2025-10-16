"use client";

import { Toaster } from "sonner"; // ✅ Import Sonner Toaster
import "@/style/globals.css";
import { Navbar } from "@/components/admin/Navbar";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="md:w-64 w-25 border-r bg-white">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden ">
          {/* Topbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 py-20">{children}</main>
        </div>

        {/* ✅ Toaster (works for all admin pages) */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
