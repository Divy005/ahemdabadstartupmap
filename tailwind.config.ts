import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#FEF4EF",
          100: "#FDE5D8",
          200: "#FAC7AC",
          300: "#F5A17A",
          400: "#EF7B4C",
          500: "#E85D26",
          600: "#CF4A17",
          700: "#A93A13",
          800: "#7E2C10",
          900: "#5B210D",
        },
        ink: {
          50: "#F1F5F8",
          100: "#DDE7EE",
          200: "#B6CBD9",
          300: "#7FA3BA",
          400: "#4C7B98",
          500: "#2E5F7E",
          600: "#1B4965",
          700: "#153A51",
          800: "#0F2B3C",
          900: "#0A1C27",
        },
        canvas: "#FAFAFA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 34, 46, 0.06), 0 1px 3px rgba(16, 34, 46, 0.05)",
        "card-hover":
          "0 8px 24px rgba(16, 34, 46, 0.10), 0 2px 6px rgba(16, 34, 46, 0.06)",
        panel: "0 12px 48px rgba(10, 28, 39, 0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out",
        "slide-up": "slide-up 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-right": "slide-in-right 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
      maxWidth: {
        page: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
