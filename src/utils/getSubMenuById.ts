import { subMenuById } from "@/service/Menu";

export const fetchSubMenuById = async (id: string) => {
  if (!id) return null;

  try {
    const subMenu = await subMenuById(id);

    return subMenu;
  } catch (error) {
    console.error("Error fetching submenu by ID:", error);
    return null;
  }
};
