"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, SearchIcon } from "../icon/icon";
import Sidebar from "../common/Sidebar";
import NavbarSkeleton from "./NavbarSkeleton";
import { NavDropdown, NavLink } from "@/types/transformerTypes";
import { useSocialMedia } from "@/utils/getSocialmedia";
import { getSubMenu } from "@/utils/getSubMenu";
import { transformMenuDataToNavLinks } from "@/lib/CommonFun";
import { Heading } from "../common/Heading";

const Navbar: React.FC = () => {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownKey, setDropdownKey] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { error } = useSocialMedia();

  // fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await getSubMenu();
        // Handle new API response structure - data is directly the array
        const menuArray = Array.isArray(menuData)
          ? menuData
          : menuData?.data || [];
        const transformed = transformMenuDataToNavLinks(menuArray);
        setNavLinks(transformed);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, []);

  // active paths
  const parts = pathname.split("/").filter(Boolean);
  const activeIndex = parts[1] || null;
  const activesubMenu = parts[2] || null;

  // search handler
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search/${encodeURIComponent(query.trim())}`);
      setQuery("");
      setShowSearch(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (error) return <div>{error.message}</div>;

  return (
    <>
      <header className="fixed top-0 z-10 w-full border-b border-gray-300 bg-white">
        <div className="px-4 sm:px-6 md:px-8 lg:px-16">
          {/* Mobile Navbar */}
          <div className="flex items-center justify-between gap-5 py-3 lg:hidden">
            <button
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="main-menu"
              onClick={() => setIsOpen(!isOpen)}
            >
              <MenuIcon />
            </button>

            <div className="flex flex-col items-center gap-2">
              <Link href={"/"}>
                <Image
                  src="/svg/da-Salon-logo.svg"
                  alt="logo"
                  width={120}
                  height={70}
                />
              </Link>
              <Heading
                as="p"
                size="xs"
                className="italic tracking-wider sm:mb-2.5"
              >
                SIMPLIFYING BEAUTY
              </Heading>
            </div>

            <div className="relative flex items-center gap-2">
              {showSearch && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center rounded border border-black bg-white px-2 py-1"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    placeholder="Search..."
                    className="w-24 px-1 text-sm outline-none sm:w-40"
                  />
                </form>
              )}
              <button
                aria-label="Search"
                onClick={() => {
                  if (!showSearch) setShowSearch(true);
                  else handleSearch();
                }}
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden lg:flex items-center justify-between py-2">
            <div className="flex flex-col gap-2">
              <Link href={"/"}>
                <Image
                  src="/svg/da-Salon-logo.svg"
                  alt="logo"
                  width={120}
                  height={70}
                />
              </Link>
              <Heading size="xs" className="italic tracking-wider sm:mb-2.5">
                SIMPLIFYING BEAUTY
              </Heading>
            </div>

            <div className="flex items-center gap-4">
              {showSearch && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center rounded border border-black bg-white px-2 py-1"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    placeholder="Search..."
                    className="w-40 px-1 text-sm outline-none md:w-60"
                  />
                </form>
              )}
              <button
                aria-label="Search"
                onClick={() => {
                  if (!showSearch) setShowSearch(true);
                  else handleSearch();
                }}
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden lg:flex items-center  gap-5 py-3">
            {navLinks.length === 0 ? (
              <NavbarSkeleton />
            ) : (
              navLinks.map((item, index) => (
                <div key={`${index}-${dropdownKey}`} className="group relative">
                  <Link
                    href={item.titlePath}
                    className={`ff-jost border-b-2 pb-0.5 text-sm font-medium tracking-wider duration-200 ${
                      activeIndex === item._id
                        ? "border-primary"
                        : "border-transparent"
                    } group-hover:border-primary`}
                  >
                    {item.title}
                  </Link>
                  {item.dropDown.length > 0 && (
                    <div className="absolute left-0 hidden rounded bg-white py-1 shadow-lg opacity-0 transition-opacity duration-200 ease-in-out group-hover:block group-hover:opacity-100">
                      {item.dropDown.map((submenu: NavDropdown, i) => (
                        <Link
                          key={i}
                          href={submenu.dropdownpath}
                          className={`block whitespace-nowrap px-6 py-2 text-sm font-medium hover:text-primary ${
                            activesubMenu === submenu._id ? "text-primary" : ""
                          }`}
                          onClick={() => setDropdownKey((prev) => prev + 1)}
                        >
                          {submenu.dropdown}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>
      </header>

      {/* Sidebar for mobile */}
      <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />
    </>
  );
};

export default Navbar;
