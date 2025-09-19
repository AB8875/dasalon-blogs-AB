import { BLOG_ENDPOINT } from "@/constants/apiEndPoints";
import axiosClient from "../AxiosClient";

// export const blogAll = async (submenuDocumentId: string) => {
//   const res = await axiosClient.get(
//     `/blogs?filters[categories][submenus][documentId][$eq]=${submenuDocumentId}&populate=*&pagination[pageSize]=4`
//   );
//   return res.data;
// };
export const blogAll = async (
  submenuDocumentId: string,
  paginate: boolean = true
) => {
  let url = `/blogs?filters[categories][submenus][documentId][$eq]=${submenuDocumentId}&sort=createdAt:desc&populate=*`;

  if (paginate) {
    url += `&pagination[pageSize]=4`;
  }

  const res = await axiosClient.get(url);
  return res.data;
};

// blogAll ko page aur pageSize support dene ke liye modify kiya
export const infiniteBlogAll = async (
  submenuDocumentId: string,
  page: number = 1,
  pageSize: number = 4
) => {
  let url = `/blogs?filters[categories][submenus][documentId][$eq]=${submenuDocumentId}&sort=createdAt:desc&populate=*`;
  url += `&pagination[pageSize]=${pageSize}&pagination[page]=${page}`;

  const res = await axiosClient.get(url);
  return res.data;
};

export const fetblogAll = async () => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?filters[featured][$eq]=true&populate=*`
  );
  return res.data;
};
export const blogBySlug = async (id: string) => {
  if (!id) {
    return;
  }
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?filters[slug][$eq]=${id}&populate=*`
  );

  return res.data;
};
export const allHomePageBlogs = async (id: string) => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?filters[submenus][documentId][$eq]=${id}&populate=*&pagination[pageSize]=5`
  );
  return res.data;
};
export const latestBlogs = async () => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?sort=createdAt:desc&populate=*`
  );
  return res.data;
};
export const blogById = async (id: string) => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?filters[documentId][$eq]=${id}&populate=*`
  );
  return res.data;
};
export const instaPost = async () => {
  const res = await axiosClient.get(
    `/instagram-feeds?populate[image][fields][0]=url`
  );
  return res.data;
};
export const subscribeSalon = async () => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?sort=createdAt:desc&populate=*`
  );
  return res.data;
};
