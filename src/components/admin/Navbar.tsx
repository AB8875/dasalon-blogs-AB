"use client";

import { useState } from "react";
import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function Navbar({
  setIsSidebarOpen,
}: {
  setIsSidebarOpen: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 z-30 h-16 w-full transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center lg:hidden">
            <Image
              src="/svg/da-Salon-logo.svg" // replace with your logo path
              alt="DaSalon"
              width={60}
              height={60}
              className="rounded-md"
            />
            {/* <span className="ml-2 text-lg font-semibold text-gray-800 hidden sm:block">
              DaSalon
            </span> */}
          </div>
        </div>

        {/* Mobile & Tablet Search Icon */}
        <div className="flex lg:hidden">
          {!mobileSearchOpen ? (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div className="absolute left-0 top-0 w-full h-16 bg-white flex items-center px-4 border-b border-gray-200">
              <Input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-10 bg-gray-50 border-gray-200 w-full"
                autoFocus
              />
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearch("");
                }}
                className="ml-2 p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Search Bar (lg and up) */}
        <div className="hidden lg:flex  relative w-full max-w-md lg:max-w-lg left-[-240px]  ">
          <Search className="absolute left-3 top-[25px] -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search posts, categories, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>
      </div>
    </header>
  );
}
