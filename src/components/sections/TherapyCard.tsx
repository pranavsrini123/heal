import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Therapy } from "@/config/content";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface TherapyCardProps {
  therapy: Therapy;
  index: number;
  onSelect: (therapy: Therapy) => void;
}

/**
 * Minimal therapy card: bold title, short description and a quiet
 * "Explore" cue. Opening it reveals the full details and the WhatsApp
 * enquiry (see TherapyModal) — nothing else competes on the card itself.
 */
export function TherapyCard({ therapy, index, onSelect }: TherapyCardProps) {
  // Phones: cards stay completely still — no entrance movement.
  const phone = useMediaQuery("(max-width: 767px)");

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(therapy)}
      aria-haspopup="dialog"
      initial={phone ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      // A low threshold so the card peeking in from a phone carousel is
      // revealed too (it is only partly on screen).
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full w-full flex-col items-start rounded-xl border border-ink-900/10 bg-cream-50 p-5 text-left transition-[border-color,transform,box-shadow] duration-500 active:border-clay-400/50 min-[375px]:p-6 [@media(hover:hover)]:hover:-translate-y-1 hover:border-clay-400/50 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-400"
    >
      <span className="font-sans text-[11px] tracking-widest2 text-clay-600/80">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h4 className="mt-2 font-display text-[1.3rem] sm:mt-4 sm:text-[1.4rem] font-bold leading-tight text-ink-900">{therapy.name}</h4>
      <p className="mt-2 flex-1 font-sans text-sm sm:mt-3 leading-relaxed text-ink-700/75">{therapy.shortDescription}</p>
      <span className="mt-4 inline-flex sm:mt-6 items-center gap-1.5 font-sans text-sm font-medium text-ink-800 transition-colors group-hover:text-clay-600">
        Explore
        <ArrowUpRight
          size={15}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </motion.button>
  );
}
