import type { Metadata } from "next";
import "@/style/globals.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import { Toaster } from "sonner"; // ✅ Import Sonner Toaster

export const metadata: Metadata = {
  title: "Dasalon Blogs",
  description: "Admin & main site for Dasalon blogs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
        {/* ✅ Global Toaster for the entire app */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
