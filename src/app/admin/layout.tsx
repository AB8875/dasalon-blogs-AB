"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // Close sidebar automatically when window resizes beyond tablet width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        <QueryClientProvider client={queryClient}>
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            // onMenuClick prop removed since not implemented
          />

          {/* Main content area */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              isSidebarOpen &&
              typeof window !== "undefined" &&
              window.innerWidth >= 1024
                ? "lg:ml-64"
                : ""
            }`}
          >
            <Navbar setIsSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 overflow-y-auto p-6 py-20 scrollbar-hide">
              {children}
            </main>
          </div>

          <Toaster richColors position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
