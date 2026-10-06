import { Star } from "lucide-react";
import { googleReviews } from "@/config/content";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * An invitation to share an experience on Google — set in the site's own
 * typography and palette rather than as a Google widget: the rating as a
 * large serif figure between two fine rules, then the same primary CTA
 * used elsewhere on the page. The figures and link live in
 * @/config/content (googleReviews).
 */
export function GoogleReviews() {
  const { rating, count, reviewUrl } = googleReviews;

  return (
    <section id="google-reviews" className="relative bg-light py-14 sm:py-24" aria-label="Google reviews">
      <div data-thread-content className="relative z-[2] mx-auto flex max-w-2xl flex-col items-center px-5 text-center sm:px-8">
        <SectionHeading eyebrow="Google Reviews" title="Your Experience Matters" />

        <RevealOnScroll delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-ink-700/85 sm:mt-6 sm:text-lg">
            If you’ve experienced healing at Sanjivini Healing Hub, we’d love to hear about your journey. Your feedback
            helps others discover a space for mindful, holistic wellness.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div
            className="mt-8 flex items-center justify-center gap-4 sm:mt-12 sm:gap-6"
            role="img"
            aria-label={`Rated ${rating} out of 5 from ${count} Google reviews`}
          >
            <span className="hidden h-px w-16 bg-primary/50 sm:block" aria-hidden="true" />
            <span className="font-display text-[3.4rem] font-semibold leading-none text-heading sm:text-7xl" aria-hidden="true">
              {rating}
            </span>
            <span className="flex flex-col items-start gap-2 border-l border-primary/30 pl-4 sm:pl-6" aria-hidden="true">
              <span className="flex gap-1 text-accent">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={17} className="fill-current" strokeWidth={1.5} />
                ))}
              </span>
              <span className="whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.22em] text-secondary-deep sm:text-xs sm:tracking-widest2">
                {count} Google Reviews
              </span>
            </span>
            <span className="hidden h-px w-16 bg-primary/50 sm:block" aria-hidden="true" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.28} className="mt-8 w-full sm:mt-10 sm:w-auto">
          <Button
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            aria-label="Write a Google Review for Sanjivini Healing Hub (opens in a new tab)"
            className="w-full max-w-[280px] justify-center sm:w-auto sm:max-w-none"
          >
            Write a Google Review
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
