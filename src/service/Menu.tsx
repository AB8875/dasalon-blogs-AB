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
    const res = await axiosClient.get(MENU_ENDPOINT.adminAll);
    const data = res?.data;
    
    // Backend returns [{ menu: {...}, submenus: [...] }]
    // We need to normalize this if the UI expects a flat structure or just pass it through
    // Based on the verification guide, the backend fixed the response to be wrapped.
    // If the UI expects the old flat structure, we might need to flatten it here.
    // But let's assume we return the raw data and let components handle it, 
    // or normalize if we know what the UI expects.
    // The previous code was trying to handle various formats.
    
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.warn("Error fetching menus, returning fallback menu:", error);
    // safe minimal fallback so UI can render
    return [
      {
        menu: { _id: "mock-home", name: "Home", slug: "home", status: true },
        submenus: [],
      },
      {
        menu: { _id: "mock-blog", name: "Blog", slug: "blog", status: true },
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
