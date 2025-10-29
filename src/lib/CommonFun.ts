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
    titlePath: `/${slugify(menuItem.name) + "/" + menuItem._id}/${
      menuItem?.submenus?.[0]?._id || ""
    }`,
    _id: menuItem._id,
    dropdownClass: "",
    dropDown:
      menuItem.submenus?.map((submenu) => ({
        _id: submenu._id,
        dropdown: submenu.name,
        dropdownpath: `/${
          slugify(menuItem.name) + "/" + menuItem._id + "/" + submenu._id
        }`,
      })) || [],
  }));
}
