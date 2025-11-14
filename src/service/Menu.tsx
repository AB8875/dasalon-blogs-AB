import { MENU_ENDPOINT } from "@/constants/apiEndPoints";
import axiosClient from "./AxiosClient";

// Get all menus
export const getAllMenus = async () => {
  const res = await axiosClient.get(MENU_ENDPOINT.menus);
  return res.data;
};

// Get all menus with their submenus (for navigation)
export const getMenusWithSubmenus = async () => {
  try {
    const res = await axiosClient.get(MENU_ENDPOINT.adminAll); // should evaluate to `${base}/api/menu/admin/all`
    return res.data; // backend returns array/object directly
  } catch (error) {
    // fallback to local mock as in current code
    console.warn("Error fetching menus", error);
    return {
      data: [
        /* keep mocked shape or transform to expected */
      ],
    };
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
