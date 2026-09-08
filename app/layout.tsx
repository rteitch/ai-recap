import type { Metadata, Viewport } from "next";
import "./globals.css";

// System font stacks instead of next/font/google: no external fetch at
// build time, which matters on build environments where fonts.googleapis.com
// may be slow or unreachable. Variables are defined in globals.css.

export const viewport: Viewport = {
  themeColor: "#14181F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-recap.rth.my.id"),
  title: "AI Recap",
  description: "Paste your notes, an article, or a meeting transcript. Get a short summary and four quiz questions to test whether it actually stuck.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  openGraph: {
    title: "AI Recap",
    description: "Paste your notes, get a summary and a quick self-test — powered by DeepSeek on EdgeOne Makers.",
    images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "AI Recap logo" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Recap",
    description: "Paste your notes, get a summary and a quick self-test.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-ink-50 antialiased">{children}</body>
    </html>
  );
}
