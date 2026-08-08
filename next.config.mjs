/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://quiz-server-ivory.vercel.app/api/auth/:path*",
      },
      {
        source: "/api/backend/:path*",
        destination: "https://quiz-server-ivory.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
