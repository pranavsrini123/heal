import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm, restrained palette: calm ivory backgrounds, deep espresso
        // for type and the dark sections, terracotta/burnt orange as the
        // primary accent (CTAs, thread, eyebrows, icons) and a muted warm
        // yellow used sparingly for small highlights on dark grounds.
        ink: {
          50: "#f7f2ee",
          100: "#ece2da",
          200: "#d9c7b9",
          300: "#bfa290",
          400: "#9c7b67",
          500: "#7d5d4b",
          600: "#634636",
          700: "#4e3529", // body text on cream
          800: "#3a271e",
          900: "#2a1c16", // headings, dark sections
          950: "#1b120e",
        },
        clay: {
          200: "#f3cfb4",
          300: "#e9a97f",
          400: "#d27a44", // burnt orange — accent CTA
          500: "#b5592a", // terracotta — eyebrows, icons
          600: "#95461f", // deep terracotta — primary CTA, small text
          700: "#77381a",
        },
        saffron: {
          200: "#f1dca0",
          300: "#e3bf68", // muted warm yellow — highlights on dark
          400: "#cfa24a",
          500: "#a9802f",
        },
        cream: {
          50: "#fffcf7",
          100: "#faf5ec", // warm ivory
          200: "#f3eadb",
          300: "#eadbc2",
          400: "#dcc6a2",
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
        "ink-radial": "radial-gradient(circle at 50% 0%, #4d2f21 0%, #24170f 70%)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(42, 28, 22, 0.15)",
        glow: "0 0 40px rgba(210, 122, 68, 0.25)",
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
