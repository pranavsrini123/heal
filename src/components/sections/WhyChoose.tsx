import { motion } from "framer-motion";
import { Leaf, HandHeart, Sparkles, Wind, Users, type LucideProps } from "lucide-react";
import { whyChoose } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LotusMotif } from "@/components/decorative/LotusMotif";

const iconMap: Record<(typeof whyChoose)[number]["icon"], React.ComponentType<LucideProps>> = {
  leaf: Leaf,
  "hand-heart": HandHeart,
  sparkles: Sparkles,
  wind: Wind,
  users: Users,
};

export function WhyChoose() {
  return (
    <section id="why-sanjivini" className="relative bg-cream-100 pb-14 pt-10 sm:pb-24 sm:pt-16" aria-label="Why choose Sanjivini">
      <div data-thread-content className="relative z-[2] mx-auto max-w-7xl px-5 sm:px-8">
        {/* Phones: the Sanjivini lotus and the title share one line. */}
        <RevealOnScroll className="md:hidden">
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-xs font-medium uppercase tracking-widest2 text-saffron-600">Our Approach</span>
            <div className="flex items-center justify-center gap-2.5">
              <LotusMotif className="h-7 w-10 shrink-0 text-clay-500" />
              <h2 className="font-display text-[1.55rem] font-semibold leading-tight text-wine-800 min-[360px]:text-[1.75rem] min-[375px]:text-3xl">
                Why Choose Sanjivini?
              </h2>
            </div>
          </div>
        </RevealOnScroll>
        <div className="hidden md:block">
          <SectionHeading eyebrow="Our Approach" title="Why Choose Sanjivini?" />
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          {whyChoose.map((item, index) => {
            const Icon = iconMap[item.icon];
            // Cream, burgundy, cream, burgundy, cream — the burgundy cards
            // are the feature cards; the cream ones give breathing room.
            const deep = index % 2 === 1;
            return (
              <RevealOnScroll key={item.title} delay={index * 0.06} className="h-full">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex h-full flex-row items-start gap-4 rounded-3xl border p-5 shadow-sm transition-shadow duration-300 hover:border-saffron-400/50 hover:shadow-soft sm:flex-col sm:p-6 ${deep ? "border-wine-700 bg-wine-700 hover:border-saffron-300/50" : "border-ink-900/5 bg-cream-50"}`}
                >
                  {/* Line icon in a fine ring — never a filled colour chip. */}
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${deep ? "border-cream-100/25 text-saffron-300" : "border-clay-300/60 text-clay-500"}`}>
                    <Icon size={19} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className={`font-display text-[1.1rem] sm:text-lg md:text-xl font-semibold leading-snug ${deep ? "text-cream-50" : "text-wine-800"}`}>
                      {item.title}
                    </h3>
                    <p className={`mt-1.5 font-sans text-sm sm:mt-2 md:text-[0.95rem] leading-relaxed ${deep ? "text-cream-100/80" : "text-ink-700/80"}`}>{item.description}</p>
                  </div>
                </motion.div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
