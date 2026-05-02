/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://20.207.122.201/evaluation-service/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
