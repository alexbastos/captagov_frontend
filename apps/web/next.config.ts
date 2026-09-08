import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const isStandaloneBuild = process.env.NEXT_STANDALONE === "true";

const nextConfig: NextConfig = {
  output: isStandaloneBuild ? "standalone" : undefined,
  transpilePackages: ["@capta/api-client"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/reset-password",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
      {
        source: "/verify-email",
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

export default withNextIntl(nextConfig);
