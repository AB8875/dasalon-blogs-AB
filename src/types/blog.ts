export interface Blog {
  id: string;
  title: string;
  slug: string;
  categories: string[];
  subCategory?: string;
  status: "draft" | "published";
  description: string;
  thumbnail?: string;
  tags?: string[];
  content: string;
  featured?: boolean;
  author: string;
  shareUrl?: string;
}
