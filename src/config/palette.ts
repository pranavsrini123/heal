/**
 * SANJIVINI COLOUR SYSTEM — the single source for every colour on the site.
 *
 * Tailwind (tailwind.config.ts) builds its colour classes from these values,
 * the same values are exposed as CSS variables (--color-primary, …) for
 * plain CSS, and the flowing thread reads its colours from here too.
 * Change a colour here and it changes everywhere.
 */
export const palette = {
  primary: "#708A6D", // muted sage green
  secondary: "#858B35", // earthy olive
  background: "#F5E3C3", // warm cream
  accent: "#D96B4B", // muted terracotta / coral
  light: "#E6D9B8", // soft beige
  neutral: "#D3D0C6", // warm neutral grey
} as const;

/**
 * Deeper and lighter tones of the palette colours, used only where
 * readability needs them (light text on a dark surface, small text on
 * cream, hover states). No colours from outside the palette's families.
 */
export const tones = {
  /** Primary sage, deepened — the hero, closing section, footer and
   *  feature cards, where cream text needs a dark enough ground. */
  forest: { 800: "#5B7058", 900: "#4E624C", 950: "#3F503D" },
  /** Primary sage at its deepest — headings on cream. */
  heading: "#344331",
  /** Secondary olive, deepened — small labels on cream. */
  secondaryDeep: "#5F6524",
  /** Accent terracotta: lighter for hover, softer on dark grounds,
   *  deeper when it is small text on cream. */
  accentLight: "#E2846A",
  accentSoft: "#EFA083",
  accentDeep: "#9A3F25",
  /** Neutral, deepened — scrollbar hover, quiet borders. */
  neutralDeep: "#BAB6A9",
} as const;

/** The flowing thread: terracotta, sage and olive. */
export const thread = {
  /** On the cream sections — the exact palette colours. */
  onLight: { accent: palette.accent, primary: palette.primary, secondary: palette.secondary },
  /** On the deep-sage hero — lighter tints of the same three, so each
   *  line stays clearly visible. */
  onDark: { accent: "#EFA083", primary: "#BFD0B9", secondary: "#D3D696" },
  /** The single line at the end — the three colours, blended. */
  unity: "#9A804F",
} as const;
