import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--text)",
        muted: "var(--muted)",
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        canvas: "var(--page)",
      },
      boxShadow: {
        soft: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
export default config;
