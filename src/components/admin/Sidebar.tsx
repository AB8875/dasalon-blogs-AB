"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/config/sidebarLinks";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface User {
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // for <768px

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(true); // always open under md
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Overlay for mobile (only >768px) */}
      {!isCollapsed && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col justify-between transform transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          !isCollapsed && (isOpen ? "translate-x-0" : "-translate-x-full"),
          "md:translate-x-0 md:w-64 md:h-screen"
        )}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dasalon Blogs
                </h1>
                <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
              </div>
            )}

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center  gap-3 px-2 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium truncate">
                            {link.label}
                          </span>
                          {link.badge && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                              {link.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>{link.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Profile Dropdown */}
        <div
          className={cn(
            "p-4 border-t border-gray-200 bg-gray-50",
            isCollapsed ? "sticky bottom-0 w-full" : ""
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left cursor-pointer">
                <Avatar className="w-10 h-10 sm:w-9 sm:h-9">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      {(user?.full_name || "Admin")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {user?.full_name || "Admin User"}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@dasalon.com"}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className={cn("w-56 sm:w-48", isCollapsed ? "ml-12" : "")}
              align="end"
            >
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer">
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Toggle Button (mobile only >768px) */}
      {!isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Desktop Spacer */}
      <div
        className={cn("hidden md:block", isCollapsed ? "md:w-20" : "md:w-64")}
      />
    </>
  );
}
