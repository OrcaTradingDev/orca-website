import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /*
  Allowed remote image domains for user avatars
  Google → lh3.googleusercontent.com
  */
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
