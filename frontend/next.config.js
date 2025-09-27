/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Handle GSAP professional plugins
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any GSAP plugin aliases here if needed
    };
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
  
  // Image domains for anime posters
  images: {
    domains: [
      'cdn.myanimelist.net',
      'example.com',
      'your-cdn-domain.com'
    ],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig;