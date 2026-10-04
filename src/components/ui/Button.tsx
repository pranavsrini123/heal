import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode, AnchorHTMLAttributes } from "react";

// Framer Motion's <motion.a> redefines a handful of native DOM event props
// (drag/animation handlers) with its own gesture-aware signatures, so those
// keys are omitted here to avoid a type conflict when spreading native
// anchor props onto it.
type NativeAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends NativeAnchorProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "accent" | "inverse";
  showArrow?: boolean;
}

/**
 * Five variants, each with a single, fixed job — no per-usage color
 * overrides anywhere else in the codebase:
 *
 *  - primary:   the default CTA on light backgrounds (deep terracotta).
 *  - secondary: a quieter alternative on light backgrounds.
 *  - ghost:     an outlined CTA for dark/photographic backgrounds.
 *  - inverse:   a solid cream CTA for dark backgrounds.
 *  - accent:    the brand's warmest moment of colour (burnt orange) —
 *               the hero's main CTA and the closing CTA section only,
 *               so it still reads as an accent.
 */
const variants: Record<string, string> = {
  primary:
    "bg-clay-600 text-cream-50 hover:bg-clay-700 shadow-soft hover:shadow-glow border border-transparent",
  secondary:
    "bg-transparent text-ink-800 border border-ink-800/30 hover:border-ink-800 hover:bg-ink-800/5",
  ghost:
    "bg-transparent text-cream-100 border border-cream-100/40 hover:border-saffron-300 hover:text-saffron-300",
  inverse:
    "bg-cream-100 text-ink-900 hover:bg-cream-50 shadow-soft border border-transparent",
  accent:
    "bg-clay-400 text-ink-950 hover:bg-clay-300 shadow-soft hover:shadow-glow border border-transparent",
};

/**
 * Shared CTA button/link used throughout the site. Renders as an anchor so
 * it can point at #section anchors, tel:, or mailto: links.
 */
export function Button({
  children,
  variant = "primary",
  showArrow = true,
  className = "",
  ...anchorProps
}: ButtonProps) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 font-sans text-sm sm:text-base font-medium tracking-wide transition-colors duration-300 ${variants[variant]} ${className}`}
      {...anchorProps}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </motion.a>
  );
}
