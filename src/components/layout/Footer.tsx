import { Phone, Instagram, Mail } from "lucide-react";
import { brand, contact, footerLine } from "@/config/content";
import { LotusMotif } from "@/components/decorative/LotusMotif";

const iconChip = "flex h-11 w-11 items-center justify-center rounded-full border border-cream-100/15 lg:h-10 lg:w-10";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-forest-950 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-12 text-cream-100/80 sm:pb-8 sm:pt-20"
      aria-label="Site footer"
    >
      <LotusMotif className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-56 text-cream-100/[0.04]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Phones: brand, then contact details and connect icons in one
            compact block. sm+: the original column layout. */}
        <div className="grid grid-cols-1 gap-8 border-b border-cream-100/10 pb-8 sm:grid-cols-2 sm:gap-10 sm:pb-12 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-3 sm:col-span-2 sm:gap-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LotusMotif className="h-6 w-9 shrink-0 text-gold-300" />
              <span className="font-display text-xl font-semibold text-cream-100">{brand.name}</span>
            </div>
            <p className="max-w-xs font-sans text-sm leading-relaxed text-cream-100/60">{brand.tagline}</p>
          </div>

          <div>
            <h4 className="mb-3 font-sans text-xs uppercase tracking-widest2 text-gold-300 sm:mb-4">Contact</h4>
            <ul className="flex flex-col gap-1 font-sans text-sm sm:gap-2.5">
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="-my-1 inline-flex min-h-[44px] items-center text-base text-cream-100/90 transition-colors hover:text-cream-100 sm:-my-3 sm:text-sm sm:text-cream-100/80 lg:my-0 lg:min-h-0"
                >
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="break-words italic text-cream-100/50">{contact.email}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-sans text-xs uppercase tracking-widest2 text-gold-300 sm:mb-4">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${contact.phone}`}
                aria-label="Call"
                className={`${iconChip} transition-colors hover:border-gold-300 hover:text-gold-300`}
              >
                <Phone size={16} />
              </a>
              <span
                aria-label="Instagram — link not yet provided"
                title="Instagram link not yet provided"
                className={`${iconChip} opacity-50`}
              >
                <Instagram size={16} />
              </span>
              <span
                aria-label="Email — address not yet provided"
                title="Email address not yet provided"
                className={`${iconChip} opacity-50`}
              >
                <Mail size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Right padding on phones keeps the copyright clear of the
            floating WhatsApp button. */}
        <div className="flex flex-col items-start justify-between gap-2 pr-20 pt-6 sm:flex-row sm:items-center sm:gap-4 sm:pt-8 lg:pr-0">
          <p className="font-display text-sm italic text-cream-100/50">{footerLine}</p>
          <p className="font-sans text-xs text-cream-100/40">
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
