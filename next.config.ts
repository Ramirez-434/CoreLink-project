import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  // @ts-ignore
  allowedDevOrigins: ['9303-170-83-159-197.ngrok-free.app', 'localhost:3000'],
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['9303-170-83-159-197.ngrok-free.app', 'localhost:3000']
    }
  }
};

export default nextConfig;
