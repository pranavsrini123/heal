import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Therapy } from "@/config/content";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface TherapyCardProps {
  therapy: Therapy;
  index: number;
  onSelect: (therapy: Therapy) => void;
  /** Card treatment within the row's rhythm (see Therapies). */
  tone?: CardTone;
}

export type CardTone = "ivory" | "blush" | "outlined" | "deep";

// Ivory and blush cards use dark type; the deep burgundy feature card
// reverses to warm ivory type with gold details.
const TONE: Record<CardTone, { card: string; title: string; body: string; num: string; rule: string; cta: string }> = {
  ivory: {
    card: "border-ink-900/10 bg-cream-50 hover:border-clay-400/50",
    title: "text-wine-800",
    body: "text-ink-700/80",
    num: "text-clay-500",
    rule: "bg-saffron-400/70",
    cta: "text-wine-600 group-hover:text-clay-600",
  },
  blush: {
    card: "border-wine-200/70 bg-wine-50 hover:border-wine-400/40",
    title: "text-wine-800",
    body: "text-ink-700/85",
    num: "text-clay-600",
    rule: "bg-saffron-400/70",
    cta: "text-wine-600 group-hover:text-clay-600",
  },
  outlined: {
    card: "border-wine-600/40 bg-cream-50 hover:border-wine-600/70",
    title: "text-wine-800",
    body: "text-ink-700/80",
    num: "text-clay-500",
    rule: "bg-saffron-400/70",
    cta: "text-wine-600 group-hover:text-clay-600",
  },
  deep: {
    card: "border-wine-700 bg-wine-700 hover:border-saffron-300/60",
    title: "text-cream-50",
    body: "text-cream-100/80",
    num: "text-saffron-300",
    rule: "bg-saffron-300/60",
    cta: "text-saffron-300 group-hover:text-saffron-200",
  },
};

/**
 * Minimal therapy card: bold title, short description and a quiet
 * "Explore" cue. Opening it reveals the full details and the WhatsApp
 * enquiry (see TherapyModal) — nothing else competes on the card itself.
 */
export function TherapyCard({ therapy, index, onSelect, tone = "ivory" }: TherapyCardProps) {
  const t = TONE[tone];
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
      className={`group flex h-full w-full flex-col items-start rounded-xl border p-5 ${t.card} text-left transition-[border-color,transform,box-shadow] duration-500 min-[375px]:p-6 [@media(hover:hover)]:hover:-translate-y-1 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-400`}
    >
      <span className={`flex items-center gap-2.5 font-sans text-[11px] tracking-widest2 ${t.num}`}>
        {String(index + 1).padStart(2, "0")}
        <span className={`h-px w-5 ${t.rule}`} aria-hidden="true" />
      </span>
      <h4 className={`mt-2 font-display text-[1.3rem] sm:mt-4 sm:text-[1.4rem] font-bold leading-tight ${t.title}`}>{therapy.name}</h4>
      <p className={`mt-2 flex-1 font-sans text-sm sm:mt-3 leading-relaxed ${t.body}`}>{therapy.shortDescription}</p>
      <span className={`mt-4 inline-flex sm:mt-6 items-center gap-1.5 font-sans text-sm font-medium transition-colors ${t.cta}`}>
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
