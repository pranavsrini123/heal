import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((prev) => (prev + delta + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index];

  return (
    <section id="testimonials" className="relative bg-cream-100 py-12 sm:py-20" aria-label="Client testimonials">
      <div data-thread-content className="relative z-[2] mx-auto max-w-3xl px-5 sm:px-8 lg:max-w-7xl">
        <SectionHeading eyebrow="Testimonials" title="Words From Our Community" />

        {/* Desktop: all three reviews side by side, in the same card style. */}
        <ul className="mt-16 hidden grid-cols-3 gap-6 lg:grid">
          {testimonials.map((t, i) => (
            <li key={t.id}>
              <RevealOnScroll delay={i * 0.08} className="h-full">
                <figure className="flex h-full flex-col items-center gap-6 rounded-3xl border border-forest-900/5 bg-cream-50 px-9 py-11 text-center shadow-sm">
                  <Quote className="shrink-0 text-gold-400" size={30} aria-hidden="true" />
                  <blockquote className="flex-1 font-display text-xl leading-relaxed text-forest-900">
                    {`"${t.quote}"`}
                  </blockquote>
                  <figcaption className="font-sans text-sm uppercase tracking-widest2 text-gold-600">{t.name}</figcaption>
                </figure>
              </RevealOnScroll>
            </li>
          ))}
        </ul>

        {/* Phones and tablets: the existing one-at-a-time carousel. */}
        <div className="relative mt-10 sm:mt-16 lg:hidden">
          <div className="relative min-h-[200px] sm:min-h-[220px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full text-center flex flex-col items-center gap-5 sm:gap-6 rounded-3xl bg-cream-50 border border-forest-900/5 shadow-sm px-6 sm:px-12 py-8 sm:py-12"
              >
                <Quote className="text-gold-400" size={30} aria-hidden="true" />
                <p
                  className={`font-display ${current.isPlaceholder ? "text-[1.2rem]" : "text-[1.1rem]"} sm:text-2xl leading-relaxed ${
                    current.isPlaceholder ? "italic text-forest-500" : "text-forest-900"
                  }`}
                >
                  {current.isPlaceholder ? `"${current.quote}"` : `"${current.quote}"`}
                </p>
                <span className="font-sans text-xs sm:text-sm uppercase tracking-widest2 text-gold-600">
                  {current.name}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8 sm:gap-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/15 text-forest-800 hover:bg-forest-800 hover:text-cream-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={19} />
            </button>

            <div className="flex items-center lg:-mx-1" role="tablist" aria-label="Select testimonial">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className="group flex h-11 min-w-[28px] items-center justify-center px-1 lg:min-w-0"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-6 bg-gold-400" : "w-2 bg-forest-900/15 group-hover:bg-forest-900/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/15 text-forest-800 hover:bg-forest-800 hover:text-cream-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
