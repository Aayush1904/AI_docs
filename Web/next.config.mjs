/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Skip static generation for pages that require auth
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
