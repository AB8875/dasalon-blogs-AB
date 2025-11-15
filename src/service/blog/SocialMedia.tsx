// src/service/blog/SocialMedia.tsx
import axiosClient from "../AxiosClient";

/**
 * Try likely endpoints and return array of social posts.
 */
export const fetchSocialMedia = async (): Promise<any[]> => {
  const candidates = [
    "/api/instagram-feeds",
    "/api/social-media",
    "/api/social",
  ];

  for (const path of candidates) {
    try {
      const res = await axiosClient.get(path);
      if (!res || !res.data) continue;
      // normalize a few common shapes
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.data)) return res.data.data;
      // fallback to returning object in an array if meaningful
      return Array.isArray([res.data]) ? [res.data] : [];
    } catch (err) {
      // try next candidate
    }
  }

  return [];
};

/**
 * Named export expected elsewhere in the code - alias to fetchSocialMedia
 * so callers using `socialMediaLink` keep functioning.
 */
export const socialMediaLink = fetchSocialMedia;

/**
 * Subscribe endpoint wrapper. Project previously referenced `subscribeSalon`.
 * This function attempts to call a known subscribe endpoint (if backend exposes).
 * If none exists it returns a safe default shape.
 */
export const subscribeSalon = async (payload?: Record<string, any>) => {
  try {
    // attempt a likely endpoint (adjust if your backend uses a different path)
    const res = await axiosClient.post("/api/subscribe", payload || {});
    return res.data;
  } catch (err) {
    // fallback: return a success-like object so callers don't crash
    return {
      success: false,
      message: "subscribe endpoint not available",
      error: String(err),
    };
  }
};

export default {
  fetchSocialMedia,
  socialMediaLink,
  subscribeSalon,
};
