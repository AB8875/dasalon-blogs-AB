import { MENU_ENDPOINT } from "@/constants/apiEndPoints";
import axiosClient from "./AxiosClient";

// Get all menus
export const getAllMenus = async () => {
  const res = await axiosClient.get(MENU_ENDPOINT.menus);
  return res.data;
};

// Get all menus with their submenus (for navigation)
export const getMenusWithSubmenus = async (): Promise<any[]> => {
  try {
    const res = await axiosClient.get(MENU_ENDPOINT.menus);
    // backend in your repo returns data directly (array/object)
    // normalize to array for safety
    const data = res?.data;
    if (Array.isArray(data)) return data;
    // if backend returns { data: [...] } wrap
    if (data && Array.isArray(data.data)) return data.data;
    // otherwise try to coerce
    return data ? (Array.isArray([data]) ? [data] : [data]) : [];
  } catch (error) {
    console.warn("Error fetching menus, returning fallback menu:", error);
    // safe minimal fallback so UI can render
    return [
      {
        _id: "mock-home",
        name: "Home",
        slug: "home",
        submenus: [],
      },
      {
        _id: "mock-blog",
        name: "Blog",
        slug: "blog",
        submenus: [{ _id: "mock-latest", name: "Latest", slug: "latest" }],
      },
    ];
  }
};

// Get menu by ID with submenus
export const getMenuById = async (id: string) => {
  try {
    const res = await axiosClient.get(`${MENU_ENDPOINT.adminById}/${id}`);
    return res.data;
  } catch (error) {
    console.warn(
      "Backend menu endpoints not available yet, using fallback data"
    );
    // Return mock data for specific menu
    const mockMenus = await getMenusWithSubmenus();
    return mockMenus.find((menu: { _id: string }) => menu._id === id) || null;
  }
};

// Get all submenus
export const getAllSubmenus = async () => {
  const res = await axiosClient.get(MENU_ENDPOINT.submenus);
  return res.data;
};

// Get submenus by parent ID
export const getSubmenusByParentId = async (parentId: string) => {
  const res = await axiosClient.get(
    `${MENU_ENDPOINT.submenus}?parent_id=${parentId}`
  );
  return res.data;
};

// Legacy function for backward compatibility
export const submenu = async () => {
  return await getMenusWithSubmenus();
};

// Legacy function for backward compatibility
export const getSubMenu = async () => {
  return await getMenusWithSubmenus();
};

// Legacy function for backward compatibility
export const subMenuById = async (id: string) => {
  return await getMenuById(id);
};

// Legacy function for backward compatibility
export const homePageSubmenuTrue = async () => {
  const res = await axiosClient.get(`${MENU_ENDPOINT.submenus}?status=true`);
  return res.data;
};
