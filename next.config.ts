import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Allow embedding in Whop iframes - note: frame-ancestors is the only CSP directive that should be set here
          // Other CSP directives (like style-src, font-src) should be handled by Next.js automatically
          { key: "Content-Security-Policy", value: "frame-ancestors https://whop.com https://*.whop.com;" },
        ],
      },
    ];
  },
};

export default nextConfig;
