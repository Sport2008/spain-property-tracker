import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        terra: {
          50:  "#fdf5f0",
          100: "#fae8dc",
          200: "#f4ccb4",
          300: "#ecaa84",
          400: "#e07f52",
          500: "#c2714f",
          600: "#a85c3d",
          700: "#8a4730",
          800: "#6f3826",
          900: "#5a2e20",
        },
        sand: {
          50:  "#faf8f5",
          100: "#f4f0ea",
          200: "#e8e0d5",
          300: "#d6cab8",
          400: "#bfaf97",
          500: "#a89678",
        },
      },
      boxShadow: {
        warm:    "0 1px 3px rgba(101,76,55,0.06), 0 4px 12px rgba(101,76,55,0.08)",
        "warm-md": "0 2px 8px rgba(101,76,55,0.08), 0 8px 24px rgba(101,76,55,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
