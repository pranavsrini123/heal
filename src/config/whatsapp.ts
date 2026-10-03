/**
 * ============================================================
 * WHATSAPP CONFIGURATION — the ONLY place the WhatsApp number lives.
 * ============================================================
 * Every WhatsApp CTA on the site (nav, hero, therapy cards, the
 * floating button, etc.) builds its link through `getWhatsAppUrl()`
 * below, which reads `WHATSAPP_NUMBER`. To change the number, edit
 * the value on the next line — nothing else in the codebase needs to change.
 */

// Client's WhatsApp number.
// Format: country code + number, digits only — no "+", spaces,
// brackets, or hyphens.
export const WHATSAPP_NUMBER = "917816832466";

/**
 * Pre-filled message templates, one per CTA context. `therapy(name)` is
 * a function (not a fixed string) so every therapy — current or
 * future — gets a correctly worded, correctly encoded message without
 * a hardcoded case per therapy.
 */
const APPOINTMENT_MESSAGE = "Hello Sanjivini Healing Hub, I would like to schedule an appointment.";

export const whatsappMessages = {
  // Default for all general appointment/contact CTAs (floating button, Contact Us).
  general: APPOINTMENT_MESSAGE,
  // "Book a Consultation" buttons (nav, hero, about) — same default message.
  consultation: APPOINTMENT_MESSAGE,
  // Therapy enquiry (inside an opened therapy card) — same concise style, with the therapy named.
  therapy: (therapyName: string) =>
    `Hello Sanjivini Healing Hub, I am interested in ${therapyName} and would like to schedule an appointment.`,
} as const;

/**
 * Builds a standard WhatsApp click-to-chat URL: https://wa.me/<number>?text=<encoded message>
 * Used by every WhatsApp CTA on the site — never construct this URL by hand elsewhere.
 */
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
