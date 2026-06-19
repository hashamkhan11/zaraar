import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        sans:    ["var(--font-body)", "system-ui", "sans-serif"],
        urdu:    ["var(--font-urdu)", "serif"],
      },
      colors: {
        zaraar: {
          black:    "#0A0A0A",
          dark:     "#111111",
          offwhite: "#F5F5F0",
          paper:    "#FAFAF8",
          gold:     "#C9A84C",
        },
      },
      animation: {
        "marquee": "zaraar-marquee 35s linear infinite",
      },
      keyframes: {
        "zaraar-marquee": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
