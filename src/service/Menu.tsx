import { MENU_ENDPOINT } from "@/constants/apiEndPoints";
import axiosClient from "./AxiosClient";

export const submenu = async () => {
  const res = await axiosClient.get(
    `${MENU_ENDPOINT.menus}?populate=submenus&sort=index:asc`
  );
  return res.data;
};
// utils/getSubMenuServer.ts
export const getSubMenu = async () => {
  const res = await axiosClient.get(`${MENU_ENDPOINT.menus}?populate=submenus`);
  return res.data;
};

export const subMenuById = async (id: string) => {
  const res = await axiosClient.get(
    `${MENU_ENDPOINT.menus}/${id && id}?populate=*`
  );
  return res.data;
};
export const homePageSubmenuTrue = async () => {
  const res = await axiosClient.get(
    `${MENU_ENDPOINT.submenu}?filters[showOnHomePage][$eq]=true&populate=menus`
  );
  return res.data;
};
