const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the shared package so Next.js processes it correctly
  transpilePackages: ["@inspire/shared"],
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pqlrhabwbajghxjukgea.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  webpack: (config) => {
    // Ensure symlinked packages resolve modules from this app's node_modules
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

module.exports = nextConfig;
