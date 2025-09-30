/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
  // Disable static export for dynamic app functionality
  // output: 'export',
  // trailingSlash: true,
  // Configure asset prefix for proper loading in Capacitor
  // assetPrefix: '',
  // Disable server-side features for static export
  // distDir: 'out'
};

export default nextConfig;
