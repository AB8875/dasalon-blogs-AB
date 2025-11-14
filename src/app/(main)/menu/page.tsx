"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type MenuType = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  submenus?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
};

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${base}/api/menu`);
        const menuArray = Array.isArray(data) ? data : data?.data || [];
        setMenus(menuArray);
      } catch (error) {
        console.error("Error fetching menus:", error);
        toast.error("Failed to load menus");
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Menus</h1>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search menus..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Menus Grid */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery
              ? "No menus found matching your search."
              : "No menus available."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMenus.map((menu) => (
            <Link
              key={menu._id}
              href={`/menu/${menu.slug}/${menu._id}`}
              className="group"
            >
              <div className="h-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Menu Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {menu.name}
                </h2>

                {/* Submenus */}
                {menu.submenus && menu.submenus.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Submenus ({menu.submenus.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {menu.submenus.slice(0, 3).map((submenu) => (
                        <span
                          key={submenu._id}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {submenu.name}
                        </span>
                      ))}
                      {menu.submenus.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{menu.submenus.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Button */}
                <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View Menu <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
