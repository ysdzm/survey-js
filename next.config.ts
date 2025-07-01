import type { NextConfig } from "next";

const prefix = '/survey-js';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  basePath: prefix,
  assetPrefix: prefix,
};

export default nextConfig;
