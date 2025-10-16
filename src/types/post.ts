// path: src/types/post.ts
export type Post = {
  id: string; // MongoDB _id as string
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string; // reference to Category
  status: "draft" | "published" | "archived";
  views: number;
  author?: string; // optional, e.g., author id or name
  createdAt: string; // ISO string
  updatedAt?: string; // optional ISO string
};
