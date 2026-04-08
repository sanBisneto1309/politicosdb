/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        green: { DEFAULT: "#1D9E75", light: "#E1F5EE", dark: "#085041" },
        amber: { DEFAULT: "#BA7517", light: "#FAEEDA" },
        coral: { DEFAULT: "#D85A30", light: "#FAECE7" },
        blue:  { DEFAULT: "#185FA5", light: "#E6F1FB" },
      },
    },
  },
  plugins: [],
};
