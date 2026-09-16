import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "var(--ink-50, #EDEEF0)",
          100: "var(--ink-100, #E2E4E9)",
          200: "var(--ink-200, #C4C9D2)",
          300: "var(--ink-300, #A0A7B5)",
          400: "var(--ink-400, #8B93A1)",
          500: "var(--ink-500, #6B7280)",
          600: "var(--ink-600, #4A5261)",
          700: "var(--ink-700, #2E3543)",
          800: "var(--ink-800, #1C222C)",
          850: "var(--ink-850, #171B24)",
          900: "var(--ink-900, #14181F)",
          950: "var(--ink-950, #0D1015)",
        },
        highlight: {
          DEFAULT: "var(--highlight, #F5C518)",
          soft: "var(--highlight-soft, rgba(245, 197, 24, 0.12))",
          hover: "var(--highlight-hover, #e5b512)",
          text: "var(--highlight-text, #0d1015)",
        },
        app: {
          bg: "var(--bg-app, #14181f)",
          sidebar: "var(--bg-sidebar, #11141a)",
          surface: "var(--bg-surface, #181924)",
          card: "var(--bg-card, #1c222c)",
          cardHover: "var(--bg-card-hover, #242b38)",
          border: "var(--border-color, rgba(255, 255, 255, 0.08))",
        },
      },
      fontFamily: {
        serif: ["var(--font-display)"],
        sans: ["var(--font-ui, var(--font-body))"],
        mono: ["var(--font-editor, var(--font-mono))"],
      },
      maxWidth: {
        page: "640px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translate3d(0, 6px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        slideLeft: {
          "0%": { transform: "translate3d(100%, 0, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        slideRight: {
          "0%": { transform: "translate3d(-100%, 0, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-left": "slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right": "slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      padding: {
        safe: "env(safe-area-inset-bottom, 1rem)",
      },
    },
  },
  plugins: [],
};

export default config;

