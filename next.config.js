/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/MANAK',
  assetPrefix: '/MANAK/',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
