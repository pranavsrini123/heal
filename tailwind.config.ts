import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { palette, tones } from "./src/config/palette";

/** The palette as CSS variables, for plain CSS (index.css). */
const cssVariables = {
  "--color-primary": palette.primary,
  "--color-secondary": palette.secondary,
  "--color-background": palette.background,
  "--color-accent": palette.accent,
  "--color-light": palette.light,
  "--color-neutral": palette.neutral,
  "--color-heading": tones.heading,
  "--color-accent-soft": tones.accentSoft,
  "--color-neutral-deep": tones.neutralDeep,
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // The Sanjivini colour system lives in src/config/palette.ts —
      // every colour class below is built from it.
      colors: {
        primary: { DEFAULT: palette.primary },
        secondary: { DEFAULT: palette.secondary, deep: tones.secondaryDeep },
        accent: {
          DEFAULT: palette.accent,
          light: tones.accentLight,
          soft: tones.accentSoft,
          deep: tones.accentDeep,
        },
        background: palette.background,
        light: palette.light,
        neutral: { DEFAULT: palette.neutral, deep: tones.neutralDeep },
        forest: tones.forest,
        heading: tones.heading,
        // Text greys/browns (unchanged): readable dark tones for body copy.
        ink: {
          50: "#f6f1ee",
          100: "#ebe1dc",
          200: "#d7c5bd",
          300: "#bba196",
          400: "#987b70",
          500: "#7a5d54",
          600: "#604740",
          700: "#4b3531", // body text on cream
          800: "#382524",
          900: "#28181a",
          950: "#1b1012",
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
        // The deep-olive surfaces (hero, closing section), softly lit from above.
        "forest-radial": `radial-gradient(circle at 50% 0%, #62660F 0%, ${tones.forest[900]} 55%, #3C3F00 100%)`,
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(42, 28, 22, 0.15)",
        glow: "0 0 40px rgba(239, 148, 0, 0.25)", // accent
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
  plugins: [plugin(({ addBase }) => addBase({ ":root": cssVariables }))],
} satisfies Config;
