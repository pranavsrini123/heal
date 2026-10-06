import { googleReviews } from "@/config/content";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/**
 * A slim strip inviting visitors to review the practice on Google: one
 * line of text and the site's primary button, between two fine rules.
 * The review link lives in @/config/content (googleReviews.reviewUrl).
 */
export function GoogleReviews() {
  return (
    <section id="google-reviews" className="relative bg-background py-4 sm:py-6" aria-label="Review us on Google">
      <div data-thread-content className="relative z-[2] mx-auto max-w-3xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="flex flex-col items-center gap-4 border-y border-primary/30 py-6 text-center sm:flex-row sm:justify-between sm:gap-8 sm:py-7 sm:text-left">
            <p className="font-display text-[1.35rem] font-semibold leading-snug text-heading sm:text-2xl">
              Loved your experience?
            </p>
            <Button
              href={googleReviews.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              aria-label="Write a Google Review for Sanjivini Healing Hub (opens in a new tab)"
              className="w-full max-w-[280px] shrink-0 justify-center sm:w-auto sm:max-w-none"
            >
              Write a Google Review
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
