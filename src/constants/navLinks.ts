import { NavLink, NavDropdown } from "@/types/transformerTypes";

// Common dropdowns reused across multiple categories
const beautyDropdown: NavDropdown[] = [
  {
    dropdown: "Skincare",
    dropdownpath: "/categories/beauty/skincare",
    documentId: "skincare",
  },
  {
    dropdown: "Makeup",
    dropdownpath: "/categories/beauty/makeup",
    documentId: "makeup",
  },
];

export const navLinks: NavLink[] = [
  {
    title: "BEAUTY",
    titlePath: "/categories/beauty",
    documentId: "beauty",
    dropDown: beautyDropdown,
  },
  {
    title: "TRENDS",
    titlePath: "/categories/trends",
    documentId: "trends",
    dropDown: beautyDropdown,
  },
  {
    title: "CAREER",
    titlePath: "/categories/career",
    documentId: "career",
    dropDown: beautyDropdown,
  },
  {
    title: "FEATURED",
    titlePath: "/categories/featured",
    documentId: "featured",
    dropDown: beautyDropdown,
  },
  {
    title: "PRODUCT",
    titlePath: "/categories/product",
    documentId: "product",
    dropDown: beautyDropdown,
  },
  {
    title: "BUSINESS",
    titlePath: "/categories/business",
    documentId: "business",
    dropDown: beautyDropdown,
  },
  {
    title: "LOCATION",
    titlePath: "/categories/location",
    documentId: "location",
    dropDown: beautyDropdown,
  },
];
