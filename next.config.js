/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pqlrhabwbajghxjukgea.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // {
      //   protocol: "https",
      //   hostname: "pqlrhabwbajghxjukgea.supabase.co",
      //   pathname: "/storage/v1/object/sign/**",
      // },
    ],
  },
};

module.exports = nextConfig;
