import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  transpilePackages: ['antd', '@ant-design/icons'],
  serverExternalPackages: ['openid-client'],
};

export default nextConfig;
