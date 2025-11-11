// src/types/settings.ts

/**
 * Represents all site configuration and branding options.
 * Mirrors backend Settings schema and is used across frontend UI and API hooks.
 */
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface SEOInfo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * Core settings entity used by both backend and frontend.
 */
export interface SiteSettings {
  /** MongoDB ObjectId as string */
  _id?: string;

  /** The public site name */
  siteName: string;

  /** A short description about the site */
  siteDescription: string;

  /** URL of the logo image */
  logo?: string;

  /** URL of the favicon image */
  favicon?: string;

  /** Contact information displayed on site footer or contact page */
  contact?: ContactInfo;

  /** Social media profile URLs */
  social?: SocialLinks;

  /** SEO meta tags for better discoverability */
  seo?: SEOInfo;

  /** Visual theme preference (light / dark / system) */
  theme: "light" | "dark" | "system";

  /** Number of posts to show per page */
  postsPerPage: number;

  /** Timestamp for last update (ISO string) */
  updatedAt?: string;

  /** (optional) Internal audit fields for admin tracking */
  lastEditedBy?: string;
}
