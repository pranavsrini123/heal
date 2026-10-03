import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f6f2",
          100: "#e0eade",
          200: "#c2d5bf",
          300: "#9bba96",
          400: "#719a6c",
          500: "#527d4d",
          600: "#3e633a",
          700: "#334f31",
          800: "#1f3320", // deep forest green
          900: "#152418", // near-black forest
          950: "#0c150e",
        },
        sage: {
          50: "#f5f7f2",
          100: "#e7ece0",
          200: "#d1dcc3",
          300: "#b3c49e",
          400: "#96af7e",
          500: "#7d9863",
          600: "#647a4e",
          700: "#4f5f3f",
          800: "#404c35",
          900: "#37402e",
        },
        cream: {
          50: "#fefdfb",
          100: "#fbf7ef", // warm ivory
          200: "#f6efdd",
          300: "#efe3c6",
          400: "#e5d1a2",
        },
        gold: {
          200: "#ecd9a8",
          300: "#ddc07e",
          400: "#c9a24e", // subtle premium gold
          500: "#af8a3c",
          600: "#8c6d2f",
        },
      },
      fontFamily: {
        // One serif family carries every heading on the site — Cormorant
        // Garamond, an elegant, editorial, wellness-appropriate serif.
        // (Previously mixed with Playfair Display, which has a heavier,
        // more corporate character; keeping to one family reads as a
        // considered typographic choice rather than an inconsistency.)
        serif: ["'Cormorant Garamond'", "serif"],
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(120deg, #c9a24e 0%, #ecd9a8 50%, #af8a3c 100%)",
        "forest-radial": "radial-gradient(circle at 50% 0%, #334f31 0%, #152418 70%)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(21, 36, 24, 0.15)",
        glow: "0 0 40px rgba(201, 162, 78, 0.25)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-slow": "float 14s ease-in-out infinite",
        "float-reverse": "floatReverse 10s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) translateX(8px) rotate(4deg)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
          "50%": { transform: "translateY(16px) translateX(-10px) rotate(-3deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      letterSpacing: {
        widest2: "0.35em",
      },
    },
  },
  plugins: [],
} satisfies Config;
