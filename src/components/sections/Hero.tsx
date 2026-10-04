import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { images } from "@/config/images";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsappMessages } from "@/config/whatsapp";
import { StoryFrame } from "@/components/story/StoryFrame";
import { TangledKnot } from "@/components/story/TangledKnot";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section id="home" className="relative overflow-hidden bg-ink-900" aria-label="Introduction">
      <div className="absolute inset-0 bg-ink-radial" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-viewport max-w-7xl items-center gap-10 px-5 pb-14 pt-24 sm:gap-14 sm:px-8 sm:pb-20 sm:pt-28 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-32">
        {/* Text */}
        <div data-thread-content className="lg:col-span-7">
          <motion.span
            {...rise(0.2)}
            className="inline-block font-sans text-[11px] uppercase tracking-[0.2em] text-saffron-300 min-[375px]:text-xs min-[375px]:tracking-widest2 sm:text-sm"
          >
            Holistic Healing &amp; Wellness
          </motion.span>

          {/* Phones/tablets: StoryThread measures this heading's lines and draws
              the tangle in the space to the right of "Mind." — the start of the
              same single stroke that runs down the page. (On desktop the tangle
              lives in the framed image on the right.) */}
          <motion.h1
            {...rise(0.35)}
            data-thread="start-compact"
            className="mt-5 font-display text-[2.1rem] font-medium leading-[1.08] text-cream-100 min-[360px]:text-[2.3rem] min-[390px]:text-[2.5rem] sm:mt-6 sm:text-6xl md:text-7xl lg:text-[5.25rem]"
          >
            <span className="block">Healing Mind.</span>
            <span className="block">
              Body. <span className="warm-text">Soul.</span>
            </span>
          </motion.h1>

          {/* Phones/tablets: a quiet caption for the tangle drawn beside the
              heading — set under it, right-aligned to the same edge, so the
              two read as one figure. (Desktop: not shown.) */}
          <motion.p
            {...rise(0.65)}
            className="ml-auto mt-4 max-w-[15rem] text-right font-display text-base italic leading-snug text-cream-100/55 lg:hidden"
          >
            When the mind feels overwhelmed, everything can feel tangled.
          </motion.p>

          <motion.p
            {...rise(0.8)}
            className="mt-6 max-w-lg font-sans text-[0.95rem] leading-relaxed min-[375px]:text-base sm:mt-8 text-cream-100/75 sm:text-lg"
          >
            Discover a natural approach to wellbeing through personalized holistic therapies designed to restore
            balance, calm and vitality.
          </motion.p>

          <motion.div {...rise(1)} className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <WhatsAppButton message={whatsappMessages.consultation} variant="accent" className="w-full justify-center sm:w-auto">
              Book a Consultation
            </WhatsAppButton>
            <Button href="#therapies" variant="ghost" className="w-full justify-center sm:w-auto">
              Explore Therapies
            </Button>
          </motion.div>

          <motion.p {...rise(1.2)} className="mt-5 font-sans text-xs tracking-wide text-cream-100/55 sm:mt-6 sm:text-sm">
            Online consultations available
          </motion.p>
        </div>

        {/* The story begins: a mind in tangles (desktop only — smaller
            screens show the tangle beside the heading instead). */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
          className="mx-auto hidden w-full max-w-sm lg:col-span-5 lg:mr-0 lg:block lg:max-w-[min(100%,calc(72svh*0.8))]"
        >
          <StoryFrame
            image={images.story.tangledMind}
            tone="dark"
            threadAnchor="start"
            placeholderTitle="A mind in tangles"
            placeholderNote="Opening image — add in src/config/images.ts"
          >
            <TangledKnot />
          </StoryFrame>
        </motion.div>
      </div>

      <motion.a
        href="#therapies"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-7 left-8 z-10 hidden items-center gap-3 text-cream-100/60 transition-colors hover:text-cream-100 lg:flex lg:left-[max(2rem,calc((100%_-_80rem)/2_+_2rem))]"
        aria-label="Scroll to explore"
      >
        <span className="font-sans text-[10px] uppercase tracking-widest2">Scroll to Explore</span>
        <motion.span
          animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  );
}
