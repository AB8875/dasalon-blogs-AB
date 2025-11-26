"use client";

import type React from "react";

import { useState, useCallback, useMemo } from "react";
import { Search, X, Menu, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SearchResult {
  id: string;
  type: "post" | "menu" | "user";
  title: string;
  subtitle?: string;
  link: string;
}

export function Navbar({
  setIsSidebarOpen,
}: {
  setIsSidebarOpen: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const [postsRes, usersRes, menusRes] = await Promise.all([
        fetch(`${apiUrl}/api/blogs?search=${encodeURIComponent(query)}`),
        fetch(`${apiUrl}/api/users?search=${encodeURIComponent(query)}`),
        fetch(`${apiUrl}/api/menu?search=${encodeURIComponent(query)}`),
      ]);

      const results: SearchResult[] = [];

      // Parse posts - CHANGE: use preview link instead of edit link
      if (postsRes.ok) {
        const posts = await postsRes.json();
        const postList = Array.isArray(posts) ? posts : posts.items || [];
        postList.slice(0, 3).forEach((post: any) => {
          results.push({
            id: post._id,
            type: "post",
            title: post.title,
            subtitle: post.menu || "Blog Post",
            // changed to preview route (open preview modal/route)
            link: `/admin/posts/preview/${post._id}`,
          });
        });
      }

      // Parse users
      if (usersRes.ok) {
        const users = await usersRes.json();
        const userList = Array.isArray(users) ? users : users.items || [];
        userList.slice(0, 2).forEach((user: any) => {
          results.push({
            id: user._id,
            type: "user",
            title: user.name,
            subtitle: user.email || "User",
            link: `/admin/profile?userId=${user._id}`,
          });
        });
      }

      // Parse menus
      if (menusRes.ok) {
        const menus = await menusRes.json();
        const menuList = Array.isArray(menus) ? menus : menus.items || [];
        menuList.slice(0, 2).forEach((menu: any) => {
          results.push({
            id: menu._id,
            type: "menu",
            title: menu.name,
            subtitle: menu.category || "Menu Item",
            link: `/admin/menu/${menu._id}`,
          });
        });
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => performSearch(query), 300);
    };
  }, [performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    // If it's a post, we navigate to preview route (or you can open a modal here)
    if (result.type === "post") {
      // If you have an in-page modal, replace this router.push with modal open logic and pass post id
      router.push(result.link);
    } else {
      router.push(result.link);
    }

    setSearch("");
    setSearchResults([]);
    setShowResults(false);
    setMobileSearchOpen(false);
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return "📝";
      case "user":
        return "👤";
      case "menu":
        return "🍽️";
      default:
        return "📄";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 z-30 h-18 w-full transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* NOTE: Removed desktop logo (lg and up).
              Only mobile logo will display (below). This ensures only one logo appears before 1024px and none after 1024px. */}
          {/* Mobile logo - compact (visible for <1024px only) */}
          <div className="flex lg:hidden p-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
            <Image
              src="/svg/da-Salon-logo.svg"
              alt="DaSalon"
              width={32}
              height={32}
              className="rounded-sm"
            />
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
            <div className="absolute left-0 top-0 w-full bg-white flex flex-col border-b border-gray-200">
              <div className="flex items-center px-4 h-16">
                <Input
                  type="search"
                  placeholder="Search posts, menus, users..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-3 pr-10 bg-gray-50 border-gray-200 w-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearch("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="ml-2 p-2 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                    >
                      <span className="text-lg">
                        {getResultIcon(result.type)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Search Bar (lg and up) - aligned to right */}
        <div className="hidden lg:flex relative ml-auto mr-4 lg:mr-[250px]  w-100">
          <div className="relative w-full">
            {/* Search input with padding for icons */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search posts, menus, users..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg w-full"
              style={{ height: 40 }}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
            {/* Dropdown styled to match input and positioned below */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition"
                  >
                    <span className="text-lg">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
