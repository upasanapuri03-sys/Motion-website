/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // All images are served from /public via CSS backgroundImage, so no
  // remote domains are required. When real product photos are added,
  // replace the CSS background-image with next/image for automatic
  // optimisation (WebP conversion, responsive srcset, lazy-loading).
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
