import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

const cardClass =
  "flex w-full flex-col items-center gap-5 rounded-3xl border border-ink-900/5 bg-cream-50 px-6 py-8 text-center shadow-sm sm:gap-6 sm:px-12 sm:py-12";
const quoteClass = "font-display text-[1.1rem] leading-relaxed text-ink-900 sm:text-2xl lg:text-[1.55rem]";
const nameClass = "font-sans text-xs uppercase tracking-widest2 text-clay-600 sm:text-sm";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((prev) => (prev + delta + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index];
  const longest = testimonials.reduce((a, b) => (b.quote.length > a.quote.length ? b : a));

  return (
    <section id="testimonials" className="relative bg-cream-100 py-12 sm:py-20" aria-label="Client testimonials">
      <div data-thread-content className="relative z-[2] mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow="Testimonials" title="Words From Our Community" />

        {/* One review at a time on every screen size; arrows and dots below.
            No autoplay — the visitor moves between them. */}
        <div className="relative mt-10 sm:mt-16">
          <div className="relative grid min-h-[200px] items-center justify-items-center overflow-hidden sm:min-h-[220px]">
            {/* Desktop: an invisible copy of the longest review holds the
                height steady, so the page never jumps between reviews. */}
            <div aria-hidden="true" className={`${cardClass} invisible hidden [grid-area:1/1] lg:flex`}>
              <Quote size={30} />
              <p className={quoteClass}>{`"${longest.quote}"`}</p>
              <span className={nameClass}>{longest.name}</span>
            </div>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`${cardClass} [grid-area:1/1]`}
              >
                <Quote className="text-saffron-400" size={30} aria-hidden="true" />
                <p className={quoteClass}>{`"${current.quote}"`}</p>
                <span className={nameClass}>{current.name}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8 sm:gap-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/15 text-ink-800 hover:bg-ink-800 hover:text-cream-100 transition-colors"
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
                      i === index ? "w-6 bg-clay-400" : "w-2 bg-ink-900/15 group-hover:bg-ink-900/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/15 text-ink-800 hover:bg-ink-800 hover:text-cream-100 transition-colors"
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
