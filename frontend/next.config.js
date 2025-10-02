/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Export configuration - continue on error during build
  // This allows the build to complete even if some pages fail SSG
  experimental: {
    // Remove this if not needed
  },
  
  // Handle GSAP professional plugins
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any GSAP plugin aliases here if needed
    };
    
    // Handle router issues during SSR
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // API configuration
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
  
  // Remote image patterns for anime posters
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'your-cdn-domain.com' }
    ]
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig;