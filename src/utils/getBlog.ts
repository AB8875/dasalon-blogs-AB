import {
  allHomePageBlogs,
  getBlogsBySubmenu,
  blogById,
  blogBySlug,
  fetblogAll,
  infiniteBlogAll,
  latestBlogs,
} from "@/service/blog/Blogs";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useBlog = (subMenuId: string) => {
  return useQuery({
    queryKey: ["blog", subMenuId],
    queryFn: () => getBlogsBySubmenu(subMenuId),
    enabled: !!subMenuId,
  });
};

// export const useBlogById = (id: string) => {
//   return useQuery({
//     queryKey: ["blog"],
//     queryFn: () => blogBySlug(id),
//   });
// };
export const fetchBlogByIdServerSide = async (id: string) => {
  if (!id) return null;

  try {
    const blog = await blogBySlug(id);
    return blog;
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    return null;
  }
};

// export const GetBlogById = (id: string) => {
//   return useQuery({
//     queryKey: ["blogbyId", id],
//     queryFn: () => blogById(id),
//     enabled: !!id,
//   });
// };
export const fetchBlogById = async (id: string) => {
  if (!id) return null;

  try {
    const blog = await blogById(id);
    return blog;
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    return null;
  }
};

// export const useFetBlog = () => {
//   return useQuery({
//     queryKey: ["feturedblog"],
//     queryFn: () => fetblogAll(),
//   });
// };
// export const useHomeBlogs = (id: string) => {
//   return useQuery({
//     queryKey: ["homeBlogs", id],
//     queryFn: () => allHomePageBlogs(id),
//     enabled: !!id,
//   });
// };
// export const useLatestBlog = () => {
//   return useQuery({
//     queryKey: ["latestblog"],
//     queryFn: () => latestBlogs(),
//   });
// };
export const fetchFeaturedBlog = async () => {
  try {
    const data = await fetblogAll();
    return data;
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    return null;
  }
};
export const fetchHomeBlogs = async (id: string) => {
  if (!id) return null;

  try {
    const data = await allHomePageBlogs(id);
    return data;
  } catch (error) {
    console.error("Error fetching home blogs:", error);
    return null;
  }
};
export const fetchLatestBlog = async () => {
  try {
    const data = await latestBlogs();
    return data;
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    return null;
  }
};

// Blog Infinite Quary

export const useInfiniteBlog = (subMenuId: string) => {
  return useInfiniteQuery({
    queryKey: ["blogs", subMenuId],
    queryFn: async ({ pageParam }) => {
      return await infiniteBlogAll(subMenuId, pageParam, 16); // pageParam = current page, 16 = pageSize
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.meta?.pagination?.pageCount; // Strapi ka pagination meta
      if (allPages.length >= totalPages) return undefined; // agar last page aa gaya to stop
      return allPages.length + 1; // next page number
    },
    enabled: !!subMenuId,
    initialPageParam: 1, // first page
  });
};
