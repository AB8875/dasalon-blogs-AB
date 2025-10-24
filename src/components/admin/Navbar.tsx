"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const [search, setSearch] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-20 md:left-64 md:w-[calc(100%-16rem)] transition-all">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Search */}
        <div className="relative w-full max-w-full md:max-w-lg lg:max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Search posts, categories, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>

        {/* Optional: add other header elements here like user menu, notifications */}
      </div>
    </header>
  );
}
