"use client";

import { Toaster } from "sonner";
import "@/style/globals.css";
import { Navbar } from "@/components/admin/Navbar";
import { Sidebar } from "@/components/admin/Sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // ✅ Special layout for login page
  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    );
  }

  // ✅ Normal admin layout
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="md:w-64 w-20 border-r bg-white">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 py-20 scrollbar-hide">
            {children}
          </main>
        </div>

        {/* Toaster */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
