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

export type CardTone = "ivory" | "deep";

// Ivory cards use dark type; the deep burgundy cards reverse to warm
// ivory type with muted-gold details.
const TONE: Record<CardTone, { card: string; title: string; body: string; num: string; rule: string; cta: string }> = {
  ivory: {
    card: "border-ink-900/10 bg-light hover:border-accent/50",
    title: "text-heading",
    body: "text-ink-700/80",
    num: "text-primary",
    rule: "bg-secondary/70",
    cta: "text-accent-deep group-hover:text-accent",
  },
  deep: {
    card: "border-forest-950/70 bg-forest-900 hover:border-light/60",
    title: "text-light",
    body: "text-background/80",
    num: "text-light",
    rule: "bg-light/60",
    cta: "text-light group-hover:text-background",
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
      className={`group flex h-full w-full flex-col items-start rounded-xl border p-5 ${t.card} text-left transition-[border-color,transform,box-shadow] duration-500 min-[375px]:p-6 [@media(hover:hover)]:hover:-translate-y-1 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
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
