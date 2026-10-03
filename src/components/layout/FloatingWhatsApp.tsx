import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWhatsAppUrl, whatsappMessages } from "@/config/whatsapp";
import { WhatsAppGlyph } from "@/components/decorative/WhatsAppGlyph";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A quiet, fixed chat affordance — deliberately understated rather than a
 * generic oversized widget: a single dark forest circle with a thin gold
 * presence ring (gold stays a rare accent, not a fill), no badge/counter,
 * no auto-opening bubble. Opens WhatsApp with the general enquiry message.
 */
export function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="fixed z-40 bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] right-[max(1rem,calc(env(safe-area-inset-right)+0.5rem))] sm:bottom-7 sm:right-7"
    >
      {/* Subtle presence ring — a slow, single-layer pulse, not a flashy
          bounce or spin. Skipped entirely under reduced motion. */}
      {!prefersReducedMotion && (
        <motion.span
          className="absolute inset-0 rounded-full border border-gold-300/60"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-forest-900 px-3.5 py-1.5 font-sans text-xs text-cream-100 shadow-soft"
            role="tooltip"
          >
            Chat with us
          </motion.span>
        )}
      </AnimatePresence>

      <motion.a
        href={getWhatsAppUrl(whatsappMessages.general)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Sanjivini Healing Hub on WhatsApp"
        onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHovered(true)}
        onBlur={() => setHovered(false)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative flex h-[52px] w-[52px] items-center sm:h-14 sm:w-14 justify-center rounded-full bg-forest-800 text-cream-100 shadow-soft hover:shadow-glow hover:bg-forest-900 transition-colors duration-300"
      >
        <WhatsAppGlyph size={24} />
      </motion.a>
    </div>
  );
}
