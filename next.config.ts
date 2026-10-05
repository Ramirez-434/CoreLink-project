import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  // @ts-ignore
  allowedDevOrigins: ['5d5a-2803-9810-2091-5130-4031-19bb-ce1a-d00d.ngrok-free.app', 'localhost:3000'],
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['5d5a-2803-9810-2091-5130-4031-19bb-ce1a-d00d.ngrok-free.app', 'localhost:3000']
    }
  }
};

export default nextConfig;
