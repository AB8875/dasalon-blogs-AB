"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NavbarProps = {
  onToggleSidebar?: () => void;
  currentUser?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
};

export function Navbar({ onToggleSidebar, currentUser }: NavbarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Menu Toggle + Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search bar */}
          <div className="relative flex-1 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search posts, categories, users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  {currentUser?.avatar_url ? (
                    <AvatarImage src={currentUser.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      {currentUser
                        ? currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "AD"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-sm font-medium">
                    {currentUser?.name || "Admin User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currentUser?.email || "admin@dasalon.com"}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search (below header) */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search posts, categories, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>
    </header>
  );
}
