import { motion } from "framer-motion";
import { images } from "@/config/images";
import { practitioner } from "@/config/content";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StoryFrame } from "@/components/story/StoryFrame";

/**
 * The destination of the story: the thread that began as a tangle in the
 * opening image arrives, calm and straight, at the therapist's portrait.
 */
export function About() {
  return (
    <section id="about" className="relative bg-cream-100 pb-16 pt-12 sm:pb-28 sm:pt-20" aria-label="About the practitioner">
      <div className="relative z-[2] mx-auto max-w-7xl px-5 sm:px-8">
        <div data-thread-content className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center sm:mb-16">
          <RevealOnScroll>
            <span className="font-sans text-xs font-medium uppercase tracking-widest2 text-clay-500 sm:text-sm">
              About Sanjivini
            </span>
          </RevealOnScroll>
          <RevealOnScroll delay={0.08}>
            <h2 className="text-balance font-display text-3xl font-semibold text-ink-900 sm:text-4xl md:text-5xl">
              Meet Your Holistic Therapist
            </h2>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Portrait — where the thread ends. Fade only (no slide), so the
              thread's end point stays exactly on the frame. */}
          <RevealOnScroll direction="none" className="lg:col-span-2">
            <div className="relative mx-auto w-[86%] max-w-sm sm:w-full">
              <StoryFrame
                image={images.story.therapist}
                tone="light"
                threadAnchor="end"
                placeholderTitle="Therapist portrait"
                placeholderNote="Add in src/config/images.ts"
                captionPosition="top"
                hidePlaceholder
                className="shadow-soft"
              />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="absolute inset-x-0 -bottom-6 mx-auto w-[88%] rounded-md bg-cream-50/95 px-4 py-3.5 sm:w-[85%] sm:px-6 sm:py-4 text-center shadow-soft backdrop-blur-sm"
              >
                <p className="font-display text-lg italic text-ink-900">{practitioner.name}</p>
                <p className="mt-1 font-sans text-xs uppercase tracking-widest2 text-clay-600">{practitioner.title}</p>
              </motion.div>
            </div>
          </RevealOnScroll>

          <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:gap-6 lg:col-span-3 lg:mt-0">
            <RevealOnScroll direction="left">
              <p className="font-sans text-base leading-relaxed text-ink-700/85 sm:text-lg">
                Anita brings a calm, attentive presence to every session at Sanjivini Healing Hub,
                guiding each client through a holistic approach shaped around their individual
                needs.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="left" delay={0.1}>
              <p className="font-sans text-base leading-relaxed text-ink-700/85 sm:text-lg">
                Her practice draws on a range of traditional, natural therapies — from acupressure
                and reflexology to breathwork and color therapy — always personalized rather than
                prescribed. Every session begins with listening.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="left" delay={0.2}>
              <p className="font-sans text-base leading-relaxed text-ink-700/85 sm:text-lg">
                Whether you are seeking relief from everyday stress or simply a quieter, more
                balanced rhythm to life, Anita works alongside you to build a gentle path forward —
                at your pace, on your terms.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
