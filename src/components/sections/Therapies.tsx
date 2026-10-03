import { useState } from "react";
import { therapies, therapyCategories, type Therapy, type TherapyCategory } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TherapyCard } from "./TherapyCard";
import { TherapyModal } from "./TherapyModal";

const categoryOrder: TherapyCategory[] = ["physical", "mental"];

export function Therapies() {
  const [selected, setSelected] = useState<Therapy | null>(null);

  return (
    <section id="therapies" className="relative bg-cream-100 pb-10 pt-16 sm:pb-16 sm:pt-28" aria-label="Our therapies">
      <div data-thread-content className="relative z-[2] mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our Therapies"
          title="Explore Our Therapies"
          subtitle="Personalized approaches for physical, emotional and energetic wellbeing."
        />

        <div className="mt-10 flex flex-col gap-10 sm:mt-16 sm:gap-16">
          {categoryOrder.map((category) => {
            const items = therapies.filter((t) => t.category === category);
            return (
              <div key={category}>
                <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-xl font-semibold text-forest-900 sm:text-2xl">
                      {therapyCategories[category].title}
                    </h3>
                    <p className="font-sans text-sm text-forest-700/70">{therapyCategories[category].description}</p>
                  </div>
                  {/* Swipe hint — only where the row scrolls. */}
                  <span className="mb-0.5 hidden shrink-0 items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest2 text-gold-600/80 md:flex xl:hidden" aria-hidden="true">
                    Swipe
                    <svg width="18" height="8" viewBox="0 0 18 8" fill="none">
                      <path d="M0 4h16m0 0L13 1m3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                {/*
                  Desktop (xl+): all five cards in one row.
                  Tablets (md–xl): a horizontally swipeable row.
                  Phones: a static stack, inset like the Why Choose cards.
                */}
                <ul className="flex flex-col gap-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:-mx-8 md:-mt-2 md:flex-row md:snap-x md:snap-mandatory md:scroll-px-8 md:gap-4 md:overflow-x-auto md:overscroll-x-contain md:px-8 md:pb-3 md:pt-2 xl:mx-0 xl:mt-0 xl:grid xl:grid-cols-5 xl:gap-5 xl:overflow-visible xl:px-0 xl:pb-0 xl:pt-0 [&::-webkit-scrollbar]:hidden">
                  {items.map((therapy, index) => (
                    <li key={therapy.id} className="w-full md:w-[280px] md:shrink-0 md:snap-start xl:w-auto xl:max-w-none">
                      <TherapyCard therapy={therapy} index={index} onSelect={setSelected} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <TherapyModal therapy={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
