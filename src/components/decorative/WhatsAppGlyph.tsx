interface WhatsAppGlyphProps {
  size?: number;
  className?: string;
}

/**
 * A simple, monochrome WhatsApp glyph rendered as inline SVG (lucide-react
 * doesn't ship brand icons). Uses `currentColor` throughout so it can be
 * styled with the site's own palette — gold on dark, forest on cream, etc —
 * rather than WhatsApp's own brand green, which would clash with the site's
 * restrained color system.
 */
export function WhatsAppGlyph({ size = 20, className = "" }: WhatsAppGlyphProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 3.5C9.1 3.5 3.5 9.1 3.5 16c0 2.4.65 4.65 1.8 6.58L3.5 28.5l6.1-1.75A12.45 12.45 0 0 0 16 28.5c6.9 0 12.5-5.6 12.5-12.5S22.9 3.5 16 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.4 10.3c.28-.6.58-.62.85-.63.22-.01.47-.01.68.01.24.02.5.04.75.6.29.65.94 2.24.98 2.4.05.16.08.35-.03.55-.11.2-.16.32-.32.5-.16.18-.34.4-.48.54-.16.16-.33.33-.15.65.19.32.83 1.37 1.78 2.22 1.22 1.1 2.25 1.44 2.57 1.6.32.16.5.14.69-.08.19-.22.8-.93 1.02-1.25.21-.32.42-.27.71-.16.29.11 1.86.88 2.18 1.04.32.16.53.24.6.38.08.14.08.79-.18 1.55-.26.76-1.5 1.49-2.08 1.58-.56.09-1.27.13-2.04-.13-.47-.16-1.07-.36-1.85-.7-3.25-1.4-5.38-4.68-5.54-4.9-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
