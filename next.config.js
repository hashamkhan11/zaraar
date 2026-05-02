/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,

  // Image optimization — disabled for static export but we set good defaults
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  // Compress output
  compress: true,

  // Production source maps off — smaller bundles
  productionBrowserSourceMaps: false,

  reactStrictMode: true,

  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Minify with SWC (default in Next 14, explicit is safer)
  swcMinify: true,

  // Headers are handled via netlify.toml for static export
};

module.exports = nextConfig;
