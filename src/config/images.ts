/**
 * ============================================================
 * IMAGE CONFIGURATION
 * ============================================================
 * Every image used across the site is defined here so it can be
 * replaced without hunting through component files.
 *
 * To add an image:
 *   1. Drop your file into /public/images/ (e.g. /public/images/tangled-mind.jpg)
 *   2. Set the matching `src` below to "/images/tangled-mind.jpg"
 * ============================================================
 */

export interface StoryImage {
  /** Leave as null to show the elegant placeholder frame. */
  src: string | null;
  alt: string;
  /** Optional CSS object-position for cropping, e.g. "50% 30%". */
  position?: string;
}

export const images = {
  /**
   * THE STORY — tangled mind → journey → clarity → therapist.
   * Both frames are portrait (4:5). Use photographs where the subject's
   * head sits in the upper third: the tangled thread is drawn around
   * that area of the first image.
   */
  story: {
    // Beginning (hero): a person whose mind feels tangled / overwhelmed.
    tangledMind: {
      src: null,
      alt: "A person lost in tangled, overwhelming thoughts",
      position: "50% 30%",
    } as StoryImage,
    // End (Meet Your Holistic Therapist): Anita A Jakati.
    // Anita's own photograph: /public/images/anita.jpg (a real project
    // asset, served as-is by Vite locally and by Vercel in production).
    // The crop keeps her face in the upper part of the 4:5 frame.
    therapist: {
      src: "/images/anita.jpg",
      alt: "Anita A Jakati, Certified Holistic Therapist",
      position: "50% 12%",
    } as StoryImage,
  },

  // Background texture behind the closing call-to-action (dark fern).
  textures: {
    darkBotanical:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=2000&q=60",
  },

  // Header image inside an opened therapy card, per category.
  therapyCategoryImages: {
    physical:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
    mental:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
  },
} as const;
