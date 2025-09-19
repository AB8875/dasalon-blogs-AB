// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["dasalon-blog.s3.ap-south-1.amazonaws.com"], // whitelist your S3 bucket
  },
};

export default nextConfig;
