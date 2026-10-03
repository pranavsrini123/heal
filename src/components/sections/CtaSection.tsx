import { motion } from "framer-motion";
import { images } from "@/config/images";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsappMessages } from "@/config/whatsapp";

/**
 * Closing invitation. A single action now (Contact Us → WhatsApp), so it
 * takes the gold emphasis and sits centred under the line it answers.
 * id="contact" keeps the navigation's "Contact" link working.
 */
export function CtaSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-forest-radial pb-20 pt-24 sm:py-32" aria-label="Begin your journey">
      <img
        src={images.textures.darkBotanical}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-forest-950/75" aria-hidden="true" />

      {/* Phones/tablets: the thread that settled at the therapist's portrait
          (centred directly above) continues down into this invitation. */}
      {/* (The observer sits on the unscaled wrapper: a scaleY(0) element
          has no area, so it would never count as "in view".) */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[1] mx-auto block h-16 w-px lg:hidden"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
      >
        <motion.span
          className="block h-full w-full origin-top bg-gradient-to-b from-gold-400/80 to-gold-400/0"
          variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1 } }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.span>

      <div className="relative z-[2] mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center sm:gap-6 sm:px-8">
        <RevealOnScroll>
          <h2 className="text-balance font-display text-[1.9rem] font-semibold leading-[1.15] text-cream-100 min-[375px]:text-[2.1rem] sm:text-5xl md:text-[3.4rem]">
            Begin Your Journey Toward Balance
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p className="max-w-[22rem] font-sans text-base leading-relaxed text-cream-100/75 sm:max-w-xl sm:text-lg">
            Take the first step toward a calmer, more balanced wellness journey.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2} className="mt-3 w-full sm:mt-4 sm:w-auto">
          <WhatsAppButton message={whatsappMessages.general} variant="gold" className="w-full max-w-[280px] justify-center sm:w-auto sm:max-w-none">
            Contact Us
          </WhatsAppButton>
        </RevealOnScroll>
      </div>
    </section>
  );
}
