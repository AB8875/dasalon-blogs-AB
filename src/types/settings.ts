export interface SiteSettings {
  _id?: string; // MongoDB ObjectId as string
  site_name: string;
  site_description: string;
  logo_url?: string;
  favicon_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  theme: "light" | "dark" | "system";
  posts_per_page: number;
  updated_at?: string;
}
