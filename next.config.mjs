/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const CSP_SCRIPT = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'";

const nextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src ${CSP_SCRIPT}; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://ai-gateway.edgeone.link https://api.openai.com https://openrouter.ai http://localhost:11434 http://localhost:1234; object-src 'none'; base-uri 'self'; form-action 'self'`,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
