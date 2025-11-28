// src/service/blog/Blogs.tsx
import { BLOG_ENDPOINT } from "@/constants/apiEndPoints";
import axiosClient from "../AxiosClient";

/**
 * Get blogs by submenu id with server-side pagination
 * Returns: { data: [...] } for backward compatibility with parts of the UI expecting .data
 */
export const getBlogsBySubmenu = async (
  submenuId: string,
  page = 1,
  limit = 16
) => {
  const url = `${
    BLOG_ENDPOINT.blogs
  }?submenu=${encodeURIComponent(
    submenuId
  )}&page=${page}&limit=${limit}&sort=createdAt:desc`;
  const res = await axiosClient.get(url);
  // backend returns array or paginated object; normalize to { data: [...] }
  const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return { data };
};

/**
 * For infinite scroll variant that still uses the older query style.
 * If your backend doesn't support the Strapi filter syntax, adapt to use ?submenu=...&page=...&limit=...
 */
export const infiniteBlogAll = async (
  submenuDocumentId: string,
  page = 1,
  pageSize = 4
) => {
  // Prefer simple query params; keep legacy Strapi-like url commented if needed.
  const url = `${BLOG_ENDPOINT.blogs}?submenu=${encodeURIComponent(
    submenuDocumentId
  )}&page=${page}&limit=${pageSize}&sort=createdAt:desc`;
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Latest blogs (most recent first)
 */
export const latestBlogs = async (limit = 5) => {
  const url = `${BLOG_ENDPOINT.blogs}?page=1&limit=${limit}&sort=createdAt:desc`;
  const res = await axiosClient.get(url);
  return { data: res.data };
};

/**
 * Get blog by database id (REST style: /api/blogs/:id)
 */
export const blogById = async (id: string) => {
  if (!id) return null;
  // If backend exposes GET /api/blogs/:id
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}/${encodeURIComponent(id)}`
  );
  return res.data;
};

/**
 * Get blog by documentId (if you store a separate documentId field and need to query it)
 * Keep this if parts of the frontend expect to query by documentId filter.
 */
export const blogByDocumentId = async (documentId: string) => {
  if (!documentId) return null;
  const url = `${BLOG_ENDPOINT.blogs}?documentId=${encodeURIComponent(
    documentId
  )}`;
  const res = await axiosClient.get(url);
  // backend may return array with single item
  return res.data;
};

/**
 * Featured blogs (used on homepage)
 */
export const fetblogAll = async (limit = 6) => {
  const url = `${BLOG_ENDPOINT.blogs}?featured=true&page=1&limit=${limit}&sort=createdAt:desc`;
  const res = await axiosClient.get(url);
  const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return { data };
};

/**
 * Get blog by slug (recommended: backend should support /api/blogs/slug/:slug or accept ?slug=)
 */
export const blogBySlug = async (slug: string) => {
  if (!slug) return null;
  // Use new dedicated slug endpoint
  const url = `${BLOG_ENDPOINT.blogs}/slug/${encodeURIComponent(slug)}`;
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Home page specific listing by submenu/document id
 */
export const allHomePageBlogs = async (id: string, limit = 5) => {
  const url = `${BLOG_ENDPOINT.blogs}?submenu=${encodeURIComponent(
    id
  )}&page=1&limit=${limit}&sort=createdAt:desc`;
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Instagram feed (unchanged)
 */
export const instaPost = async () => {
  const res = await axiosClient.get(
    `/instagram-feeds?populate[image][fields][0]=url`
  );
  return res.data;
};

/**
 * Subscribe / newsletter placeholder (keeps original name)
 */
export const subscribeSalon = async () => {
  const res = await axiosClient.get(
    `${BLOG_ENDPOINT.blogs}?page=1&limit=5&sort=createdAt:desc`
  );
  return res.data;
};
