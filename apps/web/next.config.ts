import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@capta/api-client"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/redefinir-senha",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
      {
        source: "/verificar-email",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
