import { homePageSubmenuTrue, submenu } from "@/service/Menu";
import { useQuery } from "@tanstack/react-query";

export const useSubMenu = () => {
  return useQuery({
    queryKey: ["menu"],
    queryFn: submenu,
  });
};

/**
 * Fetch submenu data for server-side rendering.
 */
export async function getSubMenu() {
  try {
    const data = await submenu(); // uses your axios call
    return data;
  } catch (error) {
    console.error("Error fetching submenu:", error);
    return null;
  }
}
export const useHomeSubMenu = () => {
  return useQuery({
    queryKey: ["submenu"],
    queryFn: homePageSubmenuTrue,
  });
};
