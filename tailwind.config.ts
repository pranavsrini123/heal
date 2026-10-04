import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Luxury-wellness palette, used with restraint:
        //  - ivory / cream / beige backgrounds (most of the page)
        //  - ink: espresso / warm charcoal for type and the dark sections
        //  - wine: deep burgundy for section headings and the primary CTA
        //  - clay: burnt terracotta for the main "Book a Consultation"
        //    accent, icons and small highlights
        //  - saffron: muted gold for section labels, the thread, quote marks
        ink: {
          50: "#f6f1ee",
          100: "#ebe1dc",
          200: "#d7c5bd",
          300: "#bba196",
          400: "#987b70",
          500: "#7a5d54",
          600: "#604740",
          700: "#4b3531", // body text on cream (warm charcoal)
          800: "#382524",
          900: "#28181a", // espresso — headings, dark sections
          950: "#1b1012",
        },
        wine: {
          400: "#a3404f",
          500: "#8a2c3c",
          600: "#722433", // primary CTA on light grounds
          700: "#5c1d29",
          800: "#4a1820", // section headings
        },
        clay: {
          50: "#fbf0e7", // the faintest terracotta wash — for one or two tinted cards
          100: "#f6e3d4",
          200: "#f3cfb4",
          300: "#e3a174",
          400: "#c96a3a", // burnt terracotta — main accent CTA
          500: "#ad5428",
          600: "#8f421f",
          700: "#73351a",
        },
        saffron: {
          200: "#f0dba3",
          300: "#e2bc68", // warm golden yellow — highlights on dark
          400: "#c99a45", // muted gold — thread, quote marks
          500: "#a77d2f",
          600: "#876422", // muted gold for labels on cream (readable)
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
        "ink-radial": "radial-gradient(circle at 50% 0%, #3b1e22 0%, #24151a 55%, #1f1215 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(42, 28, 22, 0.15)",
        glow: "0 0 40px rgba(201, 106, 58, 0.25)",
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
