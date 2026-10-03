interface LotusMotifProps {
  className?: string;
}

/**
 * A simple decorative lotus line-drawing used as a signature brand motif
 * (footer, dividers, signature elements).
 */
export function LotusMotif({ className = "" }: LotusMotifProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" aria-hidden="true">
      <path
        d="M60 70C40 70 15 58 15 38C15 45 25 50 35 45C28 38 26 25 32 15C38 25 40 38 38 45C48 40 55 28 55 15C60 28 60 40 55 48C65 40 72 28 78 15C84 28 82 40 75 48C82 44 90 38 88 30C95 42 90 58 68 68C65 69 62 70 60 70Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M20 70H100" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
