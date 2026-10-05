/**
 * SANJIVINI COLOUR SYSTEM — the single source for every colour on the site.
 *
 * Tailwind (tailwind.config.ts) builds its colour classes from these values,
 * the same values are exposed as CSS variables (--color-primary, …) for
 * plain CSS, and the flowing thread reads its colours from here too.
 * Change a colour here and it changes everywhere.
 *
 * Palette: Deep Olive #494C00 · Moss #8B8E3C · Porcelain #FDF5EA ·
 *          Honey #EF9400 · Honeycomb #9E3C00
 */
export const palette = {
  primary: "#8B8E3C", // moss — icons, outlines, the thread
  secondary: "#494C00", // deep olive — small labels
  background: "#FDF5EA", // porcelain — the page
  accent: "#EF9400", // honey — Book a Consultation, highlights
  light: "#F5E7CF", // porcelain with a touch of honey — light cards
  neutral: "#E6DCCB", // quiet borders, scrollbar
} as const;

/**
 * Deeper and lighter tones of the palette colours, used only where
 * readability needs them (light text on a dark surface, small text on
 * a light one, hover states). No colours from outside the palette's families.
 */
export const tones = {
  /** Deep olive — the hero, closing section, footer and feature cards. */
  forest: { 800: "#565A08", 900: "#494C00", 950: "#3A3C00" },
  /** Deep olive, a step deeper — headings on porcelain. */
  heading: "#3A3C00",
  /** Deep olive — small labels on porcelain. */
  secondaryDeep: "#494C00",
  /** Honey: lighter for hover, softer for the hero highlight. */
  accentLight: "#F7A923",
  accentSoft: "#F7B547",
  /** Honeycomb — "Explore" links and small accent text on light grounds. */
  accentDeep: "#9E3C00",
  /** Neutral, deepened — scrollbar hover. */
  neutralDeep: "#CDBFA3",
} as const;

/** The flowing thread: honeycomb, moss and honey. */
export const thread = {
  /** On the porcelain sections. */
  onLight: { accent: "#9E3C00", primary: "#8B8E3C", secondary: "#E08A00" },
  /** On the deep-olive hero — lighter tints of the same three, so each
   *  line stays clearly visible. */
  onDark: { accent: "#F08A4A", primary: "#C3C67A", secondary: "#F7B547" },
  /** The single line at the end — the three colours, blended. */
  unity: "#8A5A10",
} as const;
