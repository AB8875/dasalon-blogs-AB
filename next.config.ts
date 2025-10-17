/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dasalon-blog.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**", // allow all paths under this domain
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
