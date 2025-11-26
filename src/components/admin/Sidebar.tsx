"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/config/sidebarLinks";
import { cn } from "@/lib/utils";
import { ArrowLeft, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onMenuClick?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, onMenuClick }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  } | null>(null);

  // track whether viewport is mobile to avoid reading window during SSR
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleSignOut = () => {
    // example signout flow (adjust to your auth)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate to login page (if you have one)
    // router.push("/admin/login");
    window.location.href = "/admin/login";
  };

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300",
          "w-64",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:static"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">DaSalon</h1>
            </div>
            <p className="text-xs text-gray-500 font-medium ml-0">
              Blog Admin Panel
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                  if (link.href === "/admin/menu") onMenuClick?.();
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left cursor-pointer">
                <Avatar className="w-10 h-10">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  ) : (
                    <AvatarFallback>
                      {(user?.full_name || user?.name || "Admin")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {user?.full_name || user?.name || "Admin User"}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user?.email || "admin@dasalon.com"}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            {/* Dropdown content - this MUST exist for the popup to appear */}
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
