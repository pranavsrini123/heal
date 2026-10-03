import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
}

/**
 * Fades and slides content into view as it enters the viewport.
 *
 * - Falls back to a simple fade when the user prefers reduced motion.
 * - On phones the movement is lighter (shorter distance and duration), and
 *   sideways slides become small upward rises: an element starting 32px to
 *   the right of a full-width column would otherwise push past the screen
 *   edge and cause horizontal scrolling.
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 32,
  once = true,
}: RevealOnScrollProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 767px)");

  const d = phone ? Math.min(distance, 18) : distance;
  const dir = phone && (direction === "left" || direction === "right") ? "up" : direction;

  const offsets: Record<string, { x: number; y: number }> = {
    up: { x: 0, y: d },
    down: { x: 0, y: -d },
    left: { x: d, y: 0 },
    right: { x: -d, y: 0 },
    none: { x: 0, y: 0 },
  };

  const offset = prefersReducedMotion ? { x: 0, y: 0 } : offsets[dir];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: phone ? 0.15 : 0.25 }}
      transition={{ duration: phone ? 0.6 : 0.8, delay: phone ? Math.min(delay, 0.15) : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
