import { IMenuItem } from "@/types/transformerTypes";

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}
export function transformMenuDataToNavLinks(apiData: IMenuItem[]) {
  return apiData.map((menuItem) => ({
    title: menuItem?.name?.toUpperCase(),
    titlePath: `/${slugify(menuItem.name) + "/" + menuItem.documentId}/${
      menuItem?.submenus?.[0]?.documentId || ""
    }`,
    documentId: menuItem.documentId,
    dropdownClass: "",
    dropDown: menuItem.submenus.map((submenu) => ({
      documentId: submenu.documentId,
      dropdown: submenu.name,
      dropdownpath: `/${
        slugify(menuItem.name) +
        "/" +
        menuItem.documentId +
        "/" +
        submenu.documentId
      }`,
    })),
  }));
}
