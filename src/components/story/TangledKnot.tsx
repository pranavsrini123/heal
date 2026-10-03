import { motion } from "framer-motion";
import { useMemo } from "react";
import { noise, smoothPath, type Point } from "./curves";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * The "tangled mind": a single thread knotted into overlapping loops around
 * the head area of the opening image (upper third of a 4:5 frame), then
 * slipping loose out of the bottom of the frame — where the page-long
 * journey thread picks it up.
 *
 * Drawn in a fixed 400×500 coordinate space that matches the frame's 4:5
 * ratio, so it never stretches.
 */
const W = 400;
const H = 500;
export const KNOT_EXIT = { x: 0.7, y: 1 }; // where the loose end leaves the frame (fractions of W/H)

/**
 * Phones/tablets: the same knot drawn without a frame, beside the hero
 * heading. Square crop around the loops; the loose strand leaves from the
 * bottom-right corner, where the page thread picks it up.
 */
const INLINE_BOX = { x: 90, y: 45, size: 300 };
export const KNOT_EXIT_INLINE = { x: 1, y: 1 };

function buildKnot(strand: Point[]): string {
  const cx = 205;
  const cy = 150;
  const pts: Point[] = [{ x: 120, y: 70 }];
  // Overlapping loops of varying radius: a mind going round in circles.
  for (let k = 0; k < 22; k++) {
    const a = k * 2.35 + noise(k) * 0.6;
    const r = 34 + 52 * Math.abs(Math.sin(k * 1.37)) + noise(k + 50) * 10;
    pts.push({ x: cx + r * Math.cos(a) * 1.15, y: cy + r * Math.sin(a) * 0.85 });
  }
  // The loose strand: winding down and out of the frame.
  pts.push(...strand);
  return smoothPath(pts, 0.35);
}

const FRAME_STRAND: Point[] = [{ x: 244, y: 262 }, { x: 300, y: 328 }, { x: 262, y: 404 }, { x: W * KNOT_EXIT.x, y: H * KNOT_EXIT.y }];
const INLINE_STRAND: Point[] = [
  { x: 262, y: 246 },
  { x: 330, y: 282 },
  { x: INLINE_BOX.x + INLINE_BOX.size * KNOT_EXIT_INLINE.x, y: INLINE_BOX.y + INLINE_BOX.size * KNOT_EXIT_INLINE.y },
];

export function TangledKnot({ className = "", variant = "frame" }: { className?: string; variant?: "frame" | "inline" }) {
  const inline = variant === "inline";
  const d = useMemo(() => buildKnot(inline ? INLINE_STRAND : FRAME_STRAND), [inline]);
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      viewBox={inline ? `${INLINE_BOX.x} ${INLINE_BOX.y} ${INLINE_BOX.size} ${INLINE_BOX.size}` : `0 0 ${W} ${H}`}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d={d}
        stroke="#c9a24e"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduced ? 1 : 0, opacity: 0.85 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: reduced ? 0 : 3.2, delay: 0.6, ease: [0.45, 0, 0.2, 1] }}
      />
    </svg>
  );
}
