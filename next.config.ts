import type { NextConfig } from "next";

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URI ?? 'https://discord.gg/eBqCQHwJdj'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/academy',
        destination: DISCORD_URL,
        permanent: false,
      },
    ]
  },
  images : {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
    ]
  }
};

export default nextConfig;
