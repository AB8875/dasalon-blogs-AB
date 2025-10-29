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
    const res = await axiosClient.get(MENU_ENDPOINT.adminAll);
    return res.data;
  } catch (error) {
    console.warn(
      "Backend menu endpoints not available yet, using fallback data"
    );
    // Return mock data until backend is updated
    return [
      {
        _id: "beauty",
        name: "Beauty",
        slug: "beauty",
        description: "Beauty related content",
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submenus: [
          {
            _id: "skincare",
            name: "Skincare",
            slug: "skincare",
            description: "Skincare products and tips",
            status: true,
            parent_id: "beauty",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "makeup",
            name: "Makeup",
            slug: "makeup",
            description: "Makeup tutorials and products",
            status: true,
            parent_id: "beauty",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        _id: "trends",
        name: "Trends",
        slug: "trends",
        description: "Latest beauty trends",
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submenus: [
          {
            _id: "fashion-trends",
            name: "Fashion Trends",
            slug: "fashion-trends",
            description: "Latest fashion trends",
            status: true,
            parent_id: "trends",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
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
    return mockMenus.find((menu) => menu._id === id) || null;
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
