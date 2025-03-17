/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
  images: {
    domains: ["localhost"],
  },
  // 添加静态文件配置
  async rewrites() {
    return [
      {
        source: "/files/:path*",
        destination: "/api/files/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
