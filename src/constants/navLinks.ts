import { NavLink, NavDropdown } from "@/types/transformerTypes";

// Common dropdowns reused across multiple categories
const beautyDropdown: NavDropdown[] = [
  {
    dropdown: "Skincare",
    dropdownpath: "/categories/beauty/skincare",
    _id: "skincare",
  },
  {
    dropdown: "Makeup",
    dropdownpath: "/categories/beauty/makeup",
    _id: "makeup",
  },
];

export const navLinks: NavLink[] = [
  {
    title: "BEAUTY",
    titlePath: "/categories/beauty",
    _id: "beauty",
    dropDown: beautyDropdown,
  },
  {
    title: "TRENDS",
    titlePath: "/categories/trends",
    _id: "trends",
    dropDown: beautyDropdown,
  },
  {
    title: "CAREER",
    titlePath: "/categories/career",
    _id: "career",
    dropDown: beautyDropdown,
  },
  {
    title: "FEATURED",
    titlePath: "/categories/featured",
    _id: "featured",
    dropDown: beautyDropdown,
  },
  {
    title: "PRODUCT",
    titlePath: "/categories/product",
    _id: "product",
    dropDown: beautyDropdown,
  },
  {
    title: "BUSINESS",
    titlePath: "/categories/business",
    _id: "business",
    dropDown: beautyDropdown,
  },
  {
    title: "LOCATION",
    titlePath: "/categories/location",
    _id: "location",
    dropDown: beautyDropdown,
  },
];
