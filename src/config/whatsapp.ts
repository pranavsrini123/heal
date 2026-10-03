/**
 * ============================================================
 * WHATSAPP CONFIGURATION — the ONLY place the WhatsApp number lives.
 * ============================================================
 * Every WhatsApp CTA on the site (Book a Consultation, Contact Us,
 * therapy enquiries, the floating button) builds its link through `getWhatsAppUrl()`
 * below, which reads `WHATSAPP_NUMBER`. To change the number, edit
 * the value on the next line — nothing else in the codebase needs to change.
 */

// Client's WhatsApp number.
// Format: country code + number, digits only — no "+", spaces,
// brackets, or hyphens.
export const WHATSAPP_NUMBER = "917816832466";

/**
 * Pre-filled message templates, one per kind of CTA:
 *
 *  - consultation → every "Book a Consultation" button (nav, mobile menu,
 *                   hero, about, and the closing section on phones)
 *  - contact      → every "Contact Us" button, and the floating chat button
 *  - therapy(name)→ "Enquire on WhatsApp" inside an opened therapy card;
 *                   a function so each therapy is named exactly
 */
export const whatsappMessages = {
  consultation:
    "Hello Sanjivini Healing Hub, I’m interested in beginning my healing journey and would like to schedule a consultation. Please let me know the available dates and timings. Thank you.",
  contact:
    "Hello Sanjivini Healing Hub, I’d love to learn more about your therapies and how they may support my wellness journey. Kindly share some details. Thank you.",
  therapy: (therapyName: string) =>
    `Hello Sanjivini Healing Hub, I am interested in ${therapyName} and would like to know more about the therapy and schedule an appointment. Kindly let me know the available dates and timings. Thank you.`,
} as const;

/**
 * Builds a standard WhatsApp click-to-chat URL: https://wa.me/<number>?text=<encoded message>
 * Used by every WhatsApp CTA on the site — never construct this URL by hand elsewhere.
 */
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
