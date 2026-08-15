/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { hostname: 'source.unsplash.com' },
      { hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;