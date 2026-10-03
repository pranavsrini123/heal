import type { ReactNode } from "react";
import type { StoryImage } from "@/config/images";

interface StoryFrameProps {
  image: StoryImage;
  tone: "dark" | "light";
  /** Shown only while no image is supplied. */
  placeholderTitle: string;
  placeholderNote: string;
  className?: string;
  /** Overlays drawn above the image (e.g. the tangled thread). */
  children?: ReactNode;
  /** Marks this frame as a start/end anchor for the page-long thread. */
  threadAnchor?: "start" | "end";
  /** Where the placeholder caption sits (keep it clear of overlays). */
  captionPosition?: "top" | "bottom";
}

/**
 * Portrait (4:5) frame for the two story images. Until a real photograph
 * is set in src/config/images.ts it shows a quiet, clearly-labelled
 * placeholder — never a stand-in person.
 */
export function StoryFrame({
  image,
  tone,
  placeholderTitle,
  placeholderNote,
  className = "",
  children,
  threadAnchor,
  captionPosition = "bottom",
}: StoryFrameProps) {
  const dark = tone === "dark";

  return (
    <figure
      data-thread={threadAnchor}
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-[3px] ${
        dark ? "bg-forest-800 ring-1 ring-cream-100/10" : "bg-cream-200 ring-1 ring-forest-900/10"
      } ${className}`}
    >
      {image.src ? (
        <img
          src={image.src}
          alt={image.alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: image.position }}
          loading="lazy"
        />
      ) : (
        <figcaption
          className={`absolute left-0 flex max-w-[60%] flex-col gap-1.5 p-4 min-[400px]:p-6 sm:p-8 ${captionPosition === "top" ? "top-0" : "bottom-0"}`}
        >
          <span
            className={`font-sans text-[10px] uppercase tracking-widest2 ${dark ? "text-cream-100/45" : "text-forest-700/55"}`}
          >
            Image to be added
          </span>
          <span className={`font-display text-lg italic sm:text-xl ${dark ? "text-cream-100/80" : "text-forest-800/80"}`}>
            {placeholderTitle}
          </span>
          <span className={`hidden font-sans text-xs min-[400px]:block ${dark ? "text-cream-100/40" : "text-forest-700/50"}`}>
            {placeholderNote}
          </span>
        </figcaption>
      )}
      {children}
    </figure>
  );
}
