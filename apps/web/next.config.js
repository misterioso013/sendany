/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for better Windows compatibility
  webpack: (config, { isServer }) => {
    // Handle Windows path separators
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  }
};

export default nextConfig;
