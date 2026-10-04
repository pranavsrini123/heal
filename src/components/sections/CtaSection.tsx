import { images } from "@/config/images";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsappMessages } from "@/config/whatsapp";

/**
 * Closing invitation. A single WhatsApp action (Book a Consultation), so it
 * takes the gold emphasis and sits centred under the line it answers.
 * id="contact" keeps the navigation's "Contact" link working.
 */
export function CtaSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-ink-radial py-14 sm:py-32" aria-label="Begin your journey">
      <img
        src={images.textures.darkBotanical}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-ink-950/75" aria-hidden="true" />


      <div className="relative z-[2] mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center sm:gap-6 sm:px-8">
        <RevealOnScroll>
          <h2 className="text-balance font-display text-[1.9rem] font-semibold leading-[1.15] text-cream-100 min-[375px]:text-[2.1rem] sm:text-5xl md:text-[3.75rem]">
            Begin Your Journey Toward Balance
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p className="max-w-[22rem] font-sans text-base leading-relaxed text-cream-100/75 sm:max-w-xl sm:text-lg md:text-xl">
            Take the first step toward a calmer, more balanced wellness journey.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2} className="mt-2 w-full sm:mt-4 sm:w-auto">
          <WhatsAppButton message={whatsappMessages.consultation} variant="accent" className="w-full max-w-[280px] justify-center md:w-auto md:max-w-none">
            Book a Consultation
          </WhatsAppButton>
        </RevealOnScroll>
      </div>
    </section>
  );
}
