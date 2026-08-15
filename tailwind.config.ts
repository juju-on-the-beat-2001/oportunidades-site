import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFF9F2",
        paperDark: "#FCEEE1",
        ink: "#1B2340",
        inkMuted: "#5B6478",
        stamp: "#FF6F59",
        open: "#FFB648",
        urgent: "#FF5A5F",
        info: "#5C7CFA",
        dawnDeep: "#151B3B",
        dawnMid: "#5B4B8A",
        dawnGold: "#FFC857",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
