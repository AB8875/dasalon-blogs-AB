// src/constants/apiEndPoints.ts
export const MENU_ENDPOINT = {
  // Public endpoints (used by app/(main) navigation)
  menus: "/api/menu/menus",
  submenus: "/api/menu/submenus",

  // Admin endpoints (protected)
  adminAll: "/api/menu/admin/all",
  adminById: "/api/menu/admin",
};

export const BLOG_ENDPOINT = {
  blogs: "/api/blogs",
  // add other blog endpoints here as needed
};
