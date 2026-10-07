import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        baby: "#ffe4ee",
        blush: "#ffc2d9",
        rose: "#ff8fb8",
        hot: "#ff4d94",
        deep: "#b3246a",
        lav: "#e9d5ff",
        ink: "#5a1840",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,77,148,0.35)",
        soft: "0 20px 60px -20px rgba(179,36,106,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
