"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search, X, Menu, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PostPreviewModal } from "./PostPreviewModal";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SearchResult {
  id?: string; // id may sometimes be missing; be defensive
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
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debounceRef = useRef<number | undefined>(undefined);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      // Parse posts
      if (postsRes.ok) {
        const posts = await postsRes.json();
        const postList = Array.isArray(posts) ? posts : posts.items || [];
        postList.slice(0, 3).forEach((post: any) => {
          results.push({
            id: post._id ?? post.id,
            type: "post",
            title: post.title ?? "Untitled post",
            subtitle: post.menu ?? "Blog Post",
            link: `/admin/posts/preview/${post._id ?? post.id}`,
          });
        });
      }

      // Parse users
      if (usersRes.ok) {
        const users = await usersRes.json();
        const userList = Array.isArray(users) ? users : users.items || [];
        userList.slice(0, 2).forEach((user: any) => {
          results.push({
            id: user._id ?? user.id,
            type: "user",
            title: user.name ?? "Unknown user",
            subtitle: user.email ?? "User",
            link: `/admin/profile?userId=${user._id ?? user.id}`,
          });
        });
      }

      // Parse menus
      if (menusRes.ok) {
        const menus = await menusRes.json();
        const menuList = Array.isArray(menus) ? menus : menus.items || [];
        menuList.slice(0, 2).forEach((menu: any) => {
          results.push({
            id: menu._id ?? menu.id,
            type: "menu",
            title: menu.name ?? "Menu item",
            subtitle: menu.category ?? "Menu Item",
            link: `/admin/menu/${menu._id ?? menu.id}`,
          });
        });
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce wrapper using useRef to hold a numeric timeout id (browser)
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    // navigate to the result link (or open modal if needed)
    if (result.type === "post" && result.id) {
      setPreviewPostId(result.id);
      setIsPreviewOpen(true);
    } else if (result.link) {
      router.push(result.link);
    }

    // reset search UI
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

  const renderResultKey = (result: SearchResult, idx: number) =>
    // Primary: type + id; Fallback: type + link; Final fallback: type + idx + random
    `${result.type}-${result.id || result.link || idx}-${idx}`;

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    searchResults.forEach((result) => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [searchResults]);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 z-30 h-16 w-full transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden">
            {/* keep using plain img to match original behavior; replace with next/image if desired */}
            <img
              src="/logo-mobile.png"
              alt="DaSalon"
              className="h-8 w-auto mix-blend-multiply"
            />
          </div>
        </div>

        {/* Mobile & Tablet Search Icon */}
        <div className="flex lg:hidden">
          {!mobileSearchOpen ? (
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Open search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div className="absolute left-0 top-0 w-full bg-white flex flex-col border-b border-gray-200 z-50">
              <div className="flex items-center px-4 h-16">
                <Search className="w-4 h-4 text-gray-400 absolute left-7" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-9 pr-10 bg-gray-50 border-gray-200 w-full h-10 rounded-full focus-visible:ring-1 focus-visible:ring-gray-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearch("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="ml-2 p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 max-h-[calc(100vh-64px)] overflow-y-auto p-2">
                  {Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type} className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        {type}s
                      </h3>
                      <div className="space-y-1">
                        {items.map((result, idx) => (
                          <button
                            key={renderResultKey(result, idx)}
                            type="button"
                            onClick={() => handleResultClick(result)}
                            className="w-full px-3 py-2 text-left hover:bg-white hover:shadow-sm rounded-md flex items-center gap-3 transition-all"
                          >
                            <span className="text-lg bg-gray-100 p-1.5 rounded-md">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Search Bar (lg and up) */}
        <div className="hidden lg:flex relative ml-auto mr-4 lg:mr-[250px] w-full max-w-md transition-all duration-300">
          <div
            className={`relative w-full transition-all duration-300 ${
              isFocused ? "scale-105" : ""
            }`}
          >
            <Search
              className={`absolute left-3 top-1/2 mt-[4px] -translate-y-1/2 w-4 h-4 transition-colors ${
                isFocused ? "text-blue-500" : "text-gray-400"
              }`}
            />

            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => {
                setIsFocused(true);
                if (search.trim()) setShowResults(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                // Delay hiding results to allow click
                setTimeout(() => setShowResults(false), 200);
              }}
              className={`pl-10 pr-12 bg-gray-50/50 border-gray-200 rounded-xl w-full h-10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-300 ${
                isFocused
                  ? "bg-white shadow-md"
                  : "hover:bg-gray-50 hover:border-gray-300"
              }`}
            />

            {isSearching ? (
              <Loader2 className="absolute right-3   top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
            ) : search ? (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 mt-[4px] -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            )}

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type} className="mb-2 last:mb-0">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                      {type}s
                    </h3>
                    <div className="space-y-0.5">
                      {items.map((result, idx) => (
                        <button
                          key={renderResultKey(result, idx)}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            handleResultClick(result);
                          }}
                          className="w-full px-3 py-2.5 text-left hover:bg-blue-50/50 hover:text-blue-600 rounded-lg flex items-center gap-3 transition-all group"
                        >
                          <span className="text-lg bg-gray-50 group-hover:bg-white p-1.5 rounded-md shadow-sm transition-colors">
                            {getResultIcon(result.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm text-gray-700 group-hover:text-blue-700 truncate">
                                {result.title}
                              </p>
                              {result.type === "post" && (
                                <span className="text-[10px] text-gray-300 group-hover:text-blue-300">
                                  Enter to preview
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 group-hover:text-blue-400 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <PostPreviewModal
        postId={previewPostId}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </header>
  );
}
