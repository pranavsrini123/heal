import { useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { GrainOverlay } from "@/components/decorative/GrainOverlay";
import { StoryThread } from "@/components/story/StoryThread";
import { Hero } from "@/components/sections/Hero";
import { Therapies } from "@/components/sections/Therapies";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { Testimonials } from "@/components/sections/Testimonials";
import { About } from "@/components/sections/About";
import { CtaSection } from "@/components/sections/CtaSection";

/**
 * The page reads as one journey:
 *   tangled mind (Hero) → therapies → why Sanjivini → client voices →
 *   the therapist (About) → an invitation to begin (CTA).
 * A single thread (StoryThread) runs from the opening image to the
 * therapist's portrait.
 */
function App() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main ref={mainRef} className="relative overflow-x-clip">
        <StoryThread containerRef={mainRef} />
        <Hero />
        <Therapies />
        <WhyChoose />
        <Testimonials />
        <About />
        <CtaSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

export default App;
