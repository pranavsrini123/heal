import type { ReactNode } from "react";
import { RevealOnScroll } from "./RevealOnScroll";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-4 max-w-2xl ${alignment}`}>
      {eyebrow && (
        <RevealOnScroll>
          <span
            className={`text-xs sm:text-sm tracking-widest2 uppercase font-sans font-medium ${
              light ? "text-saffron-300" : "text-clay-500"
            }`}
          >
            {eyebrow}
          </span>
        </RevealOnScroll>
      )}
      <RevealOnScroll delay={0.08}>
        <h2
          className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] text-balance ${
            light ? "text-cream-100" : "text-ink-900"
          }`}
        >
          {title}
        </h2>
      </RevealOnScroll>
      {subtitle && (
        <RevealOnScroll delay={0.16}>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${light ? "text-cream-200/80" : "text-ink-700/80"}`}>
            {subtitle}
          </p>
        </RevealOnScroll>
      )}
    </div>
  );
}
