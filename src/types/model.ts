export type Id = string;

export interface Post {
  _id?: Id;
  title: string;
  slug: string;
  categoryId?: Id;
  tags?: string[];
  thumbnailUrl?: string;
  content?: string;
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: Id;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  _id?: Id;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  created_at?: string;
}
