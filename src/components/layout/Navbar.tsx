import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav, footerLine } from "@/config/content";
import { getWhatsAppUrl, whatsappMessages } from "@/config/whatsapp";
import { useScrolled } from "@/hooks/useScrolled";
import { LotusMotif } from "@/components/decorative/LotusMotif";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Navbar() {
  const scrolled = useScrolled(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // While the mobile menu is open: lock background scrolling, close on
  // Escape, and move focus into the panel (returned to the menu button).
  useEffect(() => {
    if (!mobileOpen) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    const opener = openerRef.current;
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [mobileOpen]);

  // Close first (which releases the scroll lock), then travel to the section.
  const goTo = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      setMobileOpen(false);
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(href);
        if (!el) return;
        // Land the section just below the fixed header rather than under it.
        const header = document.querySelector("header")?.offsetHeight ?? 0;
        const top = el.getBoundingClientRect().top + window.scrollY - header;
        window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
        history.replaceState(null, "", href);
      });
    },
    [reduced],
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-ink-900/10 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-3 lg:py-5"
          aria-label="Primary"
        >
          <a href="#home" className="group -my-2 flex min-h-[44px] items-center gap-2.5 py-2">
            <LotusMotif
              className={`h-6 w-9 shrink-0 sm:h-7 sm:w-10 transition-colors duration-500 ${
                scrolled ? "text-ink-800" : "text-background"
              }`}
            />
            <span
              className={`whitespace-nowrap font-display text-[1.05rem] min-[360px]:text-lg sm:text-xl lg:whitespace-normal font-semibold tracking-wide transition-colors duration-500 ${
                scrolled ? "text-ink-900" : "text-background"
              }`}
            >
              Sanjivini <span className="font-normal italic text-accent">Healing Hub</span>
            </span>
          </a>

          <ul className="hidden lg:flex items-center gap-8 font-sans text-sm tracking-wide">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`relative py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                    scrolled ? "text-ink-800 hover:text-ink-900" : "text-background/90 hover:text-background"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <a
              href={getWhatsAppUrl(whatsappMessages.consultation)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                scrolled
                  ? "bg-accent text-ink-950 hover:bg-accent-light shadow-soft"
                  : "bg-background/10 text-background border border-background/40 hover:bg-background hover:text-ink-900 backdrop-blur-sm"
              }`}
            >
              Book a Consultation
            </a>
          </div>

          <button
            ref={openerRef}
            type="button"
            className={`-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 lg:hidden ${
              scrolled ? "text-ink-900 hover:bg-ink-900/5" : "text-background hover:bg-background/10"
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={24} strokeWidth={1.6} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-contain bg-forest-950 text-background lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.4, ease: EASE, delay: 0.05 } }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-forest-radial opacity-70" />
              <LotusMotif className="absolute -bottom-10 -right-12 h-48 w-72 text-background/[0.04]" />
            </div>

            <div className="relative flex items-center justify-between px-5 py-3 sm:px-8">
              <a href="#home" onClick={(e) => goTo(e, "#home")} className="-my-2 flex min-h-[44px] items-center gap-2.5 py-2">
                <LotusMotif className="h-6 w-9 shrink-0 text-background sm:h-7 sm:w-10" />
                <span className="whitespace-nowrap font-display text-[1.05rem] font-semibold tracking-wide min-[360px]:text-lg sm:text-xl">
                  Sanjivini <span className="font-normal italic text-accent">Healing Hub</span>
                </span>
              </a>
              <button
                ref={closeRef}
                type="button"
                className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full border border-background/20 text-background transition-colors hover:border-light hover:text-light"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>

            <motion.ul
              className="relative mt-4 flex flex-col px-5 sm:mt-8 sm:px-8"
              initial="closed"
              animate="open"
              variants={{ open: { transition: { staggerChildren: reduced ? 0 : 0.045, delayChildren: reduced ? 0 : 0.2 } } }}
            >
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  className="border-b border-background/10"
                  variants={{
                    closed: { opacity: 0, y: reduced ? 0 : 14 },
                    open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => goTo(e, item.href)}
                    className="group flex min-h-[56px] items-baseline gap-4 py-3 transition-colors active:text-light sm:min-h-[64px]"
                  >
                    <span className="w-6 font-sans text-[11px] tracking-widest2 text-accent/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[1.75rem] leading-tight transition-colors group-hover:text-light sm:text-[2rem]">
                      {item.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="relative mt-auto flex flex-col gap-5 px-5 pb-8 pt-10 sm:px-8"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 0.45, ease: EASE }}
            >
              <a
                href={getWhatsAppUrl(whatsappMessages.consultation)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-accent px-7 py-3 font-sans text-base font-medium tracking-wide text-ink-950 sm:w-auto sm:self-start"
              >
                Book a Consultation
              </a>
              <p className="font-display text-sm italic text-background/40">{footerLine}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
