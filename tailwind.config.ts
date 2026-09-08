import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
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
          DEFAULT: "#FFD23F",
          soft: "#3A331A",
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
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
      },
      padding: {
        safe: "env(safe-area-inset-bottom, 1rem)",
      },
    },
  },
  plugins: [],
};

export default config;

