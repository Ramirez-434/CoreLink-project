import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  // @ts-ignore
  allowedDevOrigins: ['fcc6-154-64-45-239.ngrok-free.app', 'localhost:3000'],
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['fcc6-154-64-45-239.ngrok-free.app', 'localhost:3000']
    }
  }
};

export default nextConfig;
