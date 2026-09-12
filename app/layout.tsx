import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

// System font stacks instead of next/font/google: no external fetch at
// build time, which matters on build environments where fonts.googleapis.com
// may be slow or unreachable. Variables are defined in globals.css.

export const viewport: Viewport = {
  themeColor: "#14181F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-recap.rth.my.id"),
  title: "AI Recap — Fast Study Summaries & Active Recall Self-Test",
  description:
    "Paste your notes, an article, or a meeting transcript. Get a short summary and four quiz questions to test whether it actually stuck.",
  keywords: [
    "ai recap",
    "study companion",
    "active recall",
    "flashcard quiz",
    "meeting summary",
    "learning retention",
    "deepseek",
    "edgeone makers",
  ],
  authors: [{ name: "RTH" }],
  creator: "RTH",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    title: "AI Recap — Study Summaries & Active Recall",
    description:
      "Paste your notes, get a summary and a quick self-test — powered by DeepSeek on EdgeOne Makers.",
    url: "https://ai-recap.rth.my.id",
    siteName: "AI Recap",
    images: [{ url: "/logo.jpg", width: 1024, height: 1024, alt: "AI Recap logo" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Recap — Fast Study Summaries",
    description: "Paste your notes, get a summary and a quick self-test.",
    images: ["/logo.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Recap",
  url: "https://ai-recap.rth.my.id",
  description:
    "Paste your notes, an article, or a meeting transcript. Get a short summary and four quiz questions to test whether it actually stuck.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  creator: {
    "@type": "Person",
    "name": "RTH",
  },
  publisher: {
    "@type": "Organization",
    "name": "RTH Nexus",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

import { SonnerToaster } from "@/components/atoms/SonnerToaster";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans text-ink-50 antialiased">
        {children}
        <SonnerToaster />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`,
          }}
        />
      </body>
    </html>
  );
}
