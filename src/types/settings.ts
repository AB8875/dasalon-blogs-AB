export interface SiteSettings {
  _id?: string; // MongoDB ObjectId as string
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  theme: "light" | "dark" | "system";
  postsPerPage: number;
  updatedAt?: string;
}
