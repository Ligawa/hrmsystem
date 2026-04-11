/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {
    root: __dirname,
  },
  // React Compiler support (stable in Next.js 16)
  experimental: {
    reactCompiler: true,
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
