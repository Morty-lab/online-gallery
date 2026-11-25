/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Booth curtain: the ground that owns the page.
        curtain: {
          DEFAULT: "#1a1d5c",
          deep: "#10123d",
          fold: "#252a7c",
          line: "#3a3f96",
        },
        // Secondary text on curtain, tinted from the curtain hue (not gray).
        haze: "#aeb2e4",
        // Photo paper and the ink printed on it.
        paper: { DEFAULT: "#f2f2ef", dim: "#e2e2dd" },
        ink: { DEFAULT: "#15162c", soft: "#4a4c66" },
        // The booth's red "ready" lamp: reserved for the active element.
        lamp: { DEFAULT: "#ff4433", hot: "#ff6a5a" },
      },
      fontFamily: {
        sign: ['"Big Shoulders Display Variable"', "sans-serif"],
        sans: ['"Archivo Variable"', "system-ui", "sans-serif"],
        stamp: ['"Martian Mono"', "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        flash: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        develop: {
          "0%": { opacity: "0", filter: "brightness(1.8) saturate(0)" },
          "100%": { opacity: "1", filter: "brightness(1) saturate(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        flash: "flash 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        develop: "develop 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
