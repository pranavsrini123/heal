import type { ComponentProps } from "react";
import { Button } from "./Button";
import { getWhatsAppUrl } from "@/config/whatsapp";

interface WhatsAppButtonProps extends Omit<ComponentProps<typeof Button>, "href" | "target" | "rel"> {
  /** The pre-filled message to send — typically one of `whatsappMessages` from @/config/whatsapp. */
  message: string;
}

/**
 * A `Button` that always opens WhatsApp click-to-chat in a new tab with a
 * pre-filled message, built from the single centralized config in
 * @/config/whatsapp. Every "contact/booking" CTA on the site should use
 * this component rather than linking to WhatsApp by hand, so the number
 * and URL format only ever need to change in one place.
 */
export function WhatsAppButton({ message, ...buttonProps }: WhatsAppButtonProps) {
  return <Button href={getWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer" {...buttonProps} />;
}
