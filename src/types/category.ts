// types/category.ts
export interface Category {
  id: string; // MongoDB ObjectId as string
  name: string; // Category name
  slug: string; // URL-friendly slug
  description?: string | null; // Optional description
  parent_id?: string | null; // ID of parent category if any
  created_at: string; // Creation timestamp
  updated_at?: string | null; // Update timestamp
  subCategories?: string[];
}
