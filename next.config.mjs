/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodyParser: false,
    },
  },
};

export default nextConfig;
