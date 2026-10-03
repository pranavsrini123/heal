import { motion } from "framer-motion";
import { Leaf, HandHeart, Sparkles, Wind, Users, type LucideProps } from "lucide-react";
import { whyChoose } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

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
        <SectionHeading eyebrow="Our Approach" title="Why Choose Sanjivini?" />

        <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          {whyChoose.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <RevealOnScroll key={item.title} delay={index * 0.06} className="h-full">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex h-full flex-row items-start gap-4 rounded-3xl bg-cream-50 p-5 shadow-sm sm:flex-col sm:p-6 hover:shadow-soft border border-forest-900/5 hover:border-gold-300/40 transition-shadow duration-300"
                >
                  {/* Icon rendered as a gold line-mark on a quiet forest
                      chip — gold as an accent stroke, not a fill, keeping
                      the color rare and deliberate rather than decorative. */}
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/50 text-gold-500">
                    <Icon size={19} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.1rem] sm:text-lg font-semibold text-forest-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 font-sans text-sm sm:mt-2 text-forest-700/75 leading-relaxed">{item.description}</p>
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
