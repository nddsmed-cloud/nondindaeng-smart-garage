import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/admin/reports', destination: '/reports', permanent: true },
      { source: '/admin',         destination: '/dashboard', permanent: true },
    ];
  },
};

export default withSerwist(nextConfig);
