import type { Config } from "tailwindcss";

const config: Config = {
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
          50: "#EDEEF0",
          200: "#C4C9D2",
          400: "#8B93A1",
          600: "#4A5261",
          800: "#1C222C",
          900: "#14181F",
        },
        highlight: {
          DEFAULT: "#F5C518",
          soft: "#2A2510",
        },
      },
      fontFamily: {
        serif: ["var(--font-display)"],
        sans: ["var(--font-body)"],
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

