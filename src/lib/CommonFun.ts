// src/lib/CommonFun.ts
import { IMenuItem } from "@/types/transformerTypes";

/**
 * Simple slug helper (keeps existing behavior).
 */
export function slugify(str: string): string {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Normalize submenu container into a plain array of submenu objects.
 * Supports common shapes:
 *  - menu.submenus (array)
 *  - menu.submenus.data (array)
 *  - menu.submenus.items (array)
 *  - Strapi-like objects under attributes
 */
function getSubmenuArray(menuItem: any): any[] {
  if (!menuItem) return [];

  // Direct array
  if (Array.isArray(menuItem.submenus)) return menuItem.submenus;

  // { data: [...] } shapes
  if (menuItem.submenus && Array.isArray(menuItem.submenus.data))
    return menuItem.submenus.data;

  // { items: [...] } shapes
  if (menuItem.submenus && Array.isArray(menuItem.submenus.items))
    return menuItem.submenus.items;

  // If submenus is an object with attributes/data wrappers
  if (menuItem.submenus?.data && Array.isArray(menuItem.submenus.data))
    return menuItem.submenus.data;

  // some APIs nest the real submenu under attributes => data => attributes
  // try to pick any array found on the object
  for (const k of Object.keys(menuItem)) {
    const v = menuItem[k];
    if (v && Array.isArray(v) && v.length && typeof v[0] === "object") return v;
  }

  return [];
}

/**
 * Extract a stable id from a record supporting multiple field names.
 */
function extractId(obj: any): string {
  if (!obj) return "";
  return (
    obj._id ||
    obj.id ||
    obj.documentId ||
    (obj.attributes &&
      (obj.attributes._id || obj.attributes.id || obj.attributes.documentId)) ||
    ""
  );
}

/**
 * Main transform: convert API menu items to NavLink shape used by Navbar.
 * Produces:
 *  {
 *    _id,
 *    title,
 *    titlePath,         // /menu-slug/menuId/  (menu overview)
 *    dropdownClass,
 *    dropDown: [ { _id, dropdown, dropdownpath } ]
 *  }
 */
export function transformMenuDataToNavLinks(apiData: IMenuItem[] = []) {
  return apiData.map((menuItemRaw: any) => {
    const menuItem = menuItemRaw || {};
    const menuId = extractId(menuItem);
    const menuSlug = slugify(
      menuItem.slug || menuItem.name || menuItem.title || `${menuId}`
    );
    // titlePath points to menu overview (no submenu id appended)
    const titlePath = `/${menuSlug}/${menuId}/`;

    const submenus = getSubmenuArray(menuItem);

    const dropDown =
      (submenus || []).map((submenuRaw: any) => {
        const submenu = submenuRaw || {};
        const submenuId = extractId(submenu);
        const submenuTitle =
          submenu.name ||
          submenu.title ||
          (submenu.attributes &&
            (submenu.attributes.name || submenu.attributes.title)) ||
          "";
        const dropdownpath = `/${menuSlug}/${menuId}/${submenuId}`;
        return {
          _id: submenuId,
          dropdown: submenuTitle,
          dropdownpath,
        };
      }) || [];

    return {
      _id: menuId,
      title: (menuItem.name || menuItem.title || "").toUpperCase(),
      titlePath,
      dropdownClass: "", // reserved for UI classes
      dropDown,
    };
  });
}
