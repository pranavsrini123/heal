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


function knotPoints(strand: Point[]): Point[] {
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
  return pts;
}

export const KNOT_TENSION = 0.35;

const FRAME_STRAND: Point[] = [{ x: 244, y: 262 }, { x: 300, y: 328 }, { x: 262, y: 404 }, { x: W * KNOT_EXIT.x, y: H * KNOT_EXIT.y }];
/**
 * Phones/tablets: just the loops of the same knot (no strand). StoryThread
 * scales and places them beside the hero heading, then draws the loosening
 * strand and the page-long journey as ONE continuous stroke from them.
 */
export const knotLoopPoints = (): Point[] => knotPoints([]);

/** Desktop: the knot drawn inside the framed opening image. */
export function TangledKnot({ className = "" }: { className?: string }) {
  const d = useMemo(() => smoothPath(knotPoints(FRAME_STRAND), KNOT_TENSION), []);
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d={d}
        stroke="#858B35"
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
