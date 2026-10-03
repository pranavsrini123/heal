# Sanjivini Healing Hub

Website for **Sanjivini Healing Hub — Holistic Healing & Wellness Center**, built with React, TypeScript, Tailwind CSS, and Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173
```

## The story

The page reads as one journey — **tangled mind → therapies → why Sanjivini → client voices → the therapist → begin**. A single gold thread starts as a tangled knot in the opening image, is drawn down the page as you scroll (restless at first, calmer further down), and ends at the therapist's portrait.

- `src/components/story/TangledKnot.tsx` — the knot over the opening image (drawn in the upper third of the frame, where a head usually sits).
- `src/components/story/StoryThread.tsx` — the page-long thread. It measures the two story frames on the live page, so it adapts to every screen size.

## Adding the two story images

Both are portrait (4:5) frames, currently showing labelled placeholders. Put the files in `public/images/` and set them in `src/config/images.ts`:

```ts
story: {
  tangledMind: { src: "/images/tangled-mind.jpg", alt: "...", position: "50% 30%" },
  therapist:   { src: "/images/anita.jpg",        alt: "...", position: "50% 25%" },
}
```

`position` adjusts the crop. If the knot doesn't sit around the person's head in your photo, adjust `cx`/`cy` in `TangledKnot.tsx`.

## Where to edit things

- **WhatsApp number and messages:** `src/config/whatsapp.ts` (number `917816832466`, used everywhere from this one constant).
- **Therapies, testimonials, nav, contact details:** `src/config/content.ts`.
- **Images:** `src/config/images.ts`.
- **Colors / type:** `tailwind.config.ts`.

## Placeholders still to supply

Email, Instagram and client testimonials are marked `PLACEHOLDER` in `src/config/content.ts`.

## Safe to delete

These files are no longer used (kept as empty stubs because they couldn't be removed remotely):

```
public/_sheet.html, public/_sheet2.html, public/_sheet3.html
src/config/site.ts
src/hooks/useScrollProgress.ts
src/components/ui/Label.tsx, src/components/ui/Picture.tsx
src/components/layout/Wordmark.tsx
src/components/sections/Philosophy.tsx, Approach.tsx, OnlineConsultation.tsx, Contact.tsx, TherapyIcon.tsx
src/components/decorative/FloatingParticles.tsx, FloatingLeaf.tsx, BlurredGlow.tsx, ScrollProgressBar.tsx
```
