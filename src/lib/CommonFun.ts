// src/lib/CommonFun.ts
export function slugify(str: string): string {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

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

function getSubmenuArray(menu: any): any[] {
  if (!menu) return [];
  if (Array.isArray(menu.submenus)) return menu.submenus;
  if (menu.submenus?.data && Array.isArray(menu.submenus.data))
    return menu.submenus.data;
  if (menu.submenus?.items && Array.isArray(menu.submenus.items))
    return menu.submenus.items;

  // try to find any array value on the object as fallback
  for (const k of Object.keys(menu)) {
    if (Array.isArray(menu[k])) return menu[k];
  }

  return [];
}

/**
 * transformMenuDataToNavLinks
 * Produces { _id, title, titlePath, dropDown: [{ _id, dropdown, dropdownpath }] }
 */
export function transformMenuDataToNavLinks(apiData: any[] = []) {
  return apiData.map((menuItemRaw: any) => {
    const menuItem = menuItemRaw || {};
    const menuId = extractId(menuItem);
    const menuSlug = slugify(
      menuItem.slug || menuItem.name || menuItem.title || menuId
    );

    // titlePath is menu overview (no submenu id)
    const titlePath = `/${menuSlug}/${menuId}`;

    const submenus = getSubmenuArray(menuItem);

    const dropDown =
      (submenus || []).map((submenuRaw: any) => {
        const submenu = submenuRaw || {};
        const submenuIdRaw = extractId(submenu);
        const submenuId = submenuIdRaw ? String(submenuIdRaw) : "";

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
      dropdownClass: "",
      dropDown,
    };
  });
}
