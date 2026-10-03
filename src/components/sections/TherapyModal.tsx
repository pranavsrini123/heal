import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useEffect } from "react";
import type { Therapy } from "@/config/content";
import { therapyCategories } from "@/config/content";
import { images } from "@/config/images";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsappMessages } from "@/config/whatsapp";

interface TherapyModalProps {
  therapy: Therapy | null;
  onClose: () => void;
}

export function TherapyModal({ therapy, onClose }: TherapyModalProps) {
  useEffect(() => {
    if (!therapy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [therapy, onClose]);

  return (
    <AnimatePresence>
      {therapy && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="therapy-modal-title"
        >
          <motion.div
            className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="relative w-full max-w-lg max-h-[85vh] max-h-[85svh] overflow-y-auto overscroll-contain rounded-xl bg-cream-50 shadow-soft"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-36 sm:h-44 overflow-hidden">
              <img
                src={images.therapyCategoryImages[therapy.category]}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/30 to-forest-950/10" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-cream-50/90 text-forest-900 sm:right-4 sm:top-4 hover:bg-cream-50 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <span className="absolute bottom-4 left-6 font-sans text-[11px] uppercase tracking-widest2 text-cream-100/85">
                {therapyCategories[therapy.category].title}
              </span>
            </div>

            <div className="p-5 min-[375px]:p-6 sm:p-8">
              <h3 id="therapy-modal-title" className="font-display text-[1.6rem] leading-tight sm:text-3xl font-bold text-forest-900">
                {therapy.name}
              </h3>
              <p className="mt-3 sm:mt-4 font-sans text-[0.95rem] sm:text-base text-forest-700/85 leading-relaxed">
                {therapy.details}
              </p>

              <div className="mt-6">
                <h4 className="font-sans text-xs uppercase tracking-widest2 text-gold-600 font-medium mb-3">
                  What a session involves
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {therapy.sessionInvolves.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 font-sans text-sm text-forest-800">
                      <Check size={16} className="mt-0.5 shrink-0 text-gold-500" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 sm:mt-8">
                <WhatsAppButton message={whatsappMessages.therapy(therapy.name)} variant="primary" onClick={onClose} className="w-full justify-center sm:w-auto">
                  Enquire on WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
