/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', '@prisma/client', 'bcryptjs']
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  }
};

export default nextConfig;
