import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  transpilePackages: ['antd', '@ant-design/icons'],
  serverExternalPackages: ['openid-client', 'ali-oss', 'urllib'],
  allowedDevOrigins: ['192.168.1.12'],
};

export default nextConfig;
