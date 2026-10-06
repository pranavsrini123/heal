/**
 * ============================================================
 * SITE CONTENT
 * ============================================================
 * Editable copy: navigation, therapies, testimonials, contact
 * details. Anything marked PLACEHOLDER was not supplied in the
 * original brief and should be replaced with real information
 * before launch.
 * ============================================================
 */

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Therapies", href: "#therapies" },
  { label: "Why Sanjivini", href: "#why-sanjivini" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export const brand = {
  name: "Sanjivini Healing Hub",
  tagline: "Holistic Healing & Wellness Center",
  philosophy: "Healing Mind • Body • Soul",
};

export const practitioner = {
  name: "Anita A Jakati",
  title: "Certified Holistic Therapist",
};

export type TherapyCategory = "physical" | "mental";

export interface Therapy {
  id: string;
  name: string;
  category: TherapyCategory;
  shortDescription: string;
  details: string;
  sessionInvolves: string[];
}

export const therapyCategories: Record<TherapyCategory, { title: string; description: string }> = {
  physical: {
    title: "Physical & Energy Healing",
    description: "Restoring balance through the body's own natural pathways.",
  },
  mental: {
    title: "Mental & Emotional Wellness",
    description: "Calming the mind and supporting emotional clarity.",
  },
};

export const therapies: Therapy[] = [
  {
    id: "acupressure",
    name: "Acupressure Therapy",
    category: "physical",
    shortDescription: "Gentle pressure applied to specific points to support the body's natural balance.",
    details:
      "Acupressure Therapy uses focused, gentle pressure on specific points across the body, drawing on traditional holistic practices intended to support relaxation and the body's natural sense of balance.",
    sessionInvolves: [
      "A conversation about your current wellbeing and goals",
      "Gentle pressure applied to relevant points",
      "A calm, guided session in a peaceful setting",
    ],
  },
  {
    id: "sujok",
    name: "Sujok Therapy",
    category: "physical",
    shortDescription: "A holistic approach centered on the hands and feet as reflections of the whole body.",
    details:
      "Sujok Therapy is a holistic practice that treats the hands and feet as microsystems reflecting the whole body, using gentle stimulation to support overall balance.",
    sessionInvolves: [
      "Assessment of areas of tension or imbalance",
      "Gentle stimulation of corresponding points on hands and feet",
      "Guidance for supportive practice between sessions",
    ],
  },
  {
    id: "seed-therapy",
    name: "Seed Therapy",
    category: "physical",
    shortDescription: "A gentle, natural complement to acupressure using seeds placed on specific points.",
    details:
      "Seed Therapy is a gentle, natural technique in which small seeds are placed on specific points of the body to provide continued, subtle stimulation after a session.",
    sessionInvolves: [
      "Identification of relevant points",
      "Careful placement of seeds using natural adhesive",
      "Guidance on care and duration",
    ],
  },
  {
    id: "nabhi-chikitsa",
    name: "Nabhi Chikitsa",
    category: "physical",
    shortDescription: "A traditional holistic approach centered on navel balance.",
    details:
      "Nabhi Chikitsa is a traditional holistic technique focused on the navel center, intended to support the body's overall sense of alignment and balance.",
    sessionInvolves: [
      "A gentle physical assessment",
      "Traditional balancing technique applied with care",
      "Discussion of supportive daily habits",
    ],
  },
  {
    id: "reflexology",
    name: "Reflexology",
    category: "physical",
    shortDescription: "Targeted pressure on the feet, hands or ears to encourage relaxation throughout the body.",
    details:
      "Reflexology applies targeted pressure to specific points on the feet, hands, or ears, believed to correspond to different areas of the body, to encourage deep relaxation.",
    sessionInvolves: [
      "A comfortable, guided foot or hand session",
      "Targeted pressure along reflex points",
      "A closing period of quiet rest",
    ],
  },
  {
    id: "breathing",
    name: "Breathing Techniques",
    category: "mental",
    shortDescription: "Guided breathwork to calm the nervous system and steady the mind.",
    details:
      "Guided breathing techniques help calm the nervous system, steady the mind, and build a practice you can carry with you well beyond the session.",
    sessionInvolves: [
      "Guided breathing exercises suited to your needs",
      "Techniques for calming the mind in daily life",
      "A restful closing period",
    ],
  },
  {
    id: "color-therapy",
    name: "Color Therapy",
    category: "mental",
    shortDescription: "Using color and light to support emotional balance and calm.",
    details:
      "Color Therapy explores the gentle use of color and light as a complementary approach to emotional balance and calm, drawn from traditional holistic practice.",
    sessionInvolves: [
      "A discussion of your current emotional state",
      "Guided exposure to and reflection on color",
      "Personalized suggestions for daily practice",
    ],
  },
  {
    id: "numerology",
    name: "Numerology",
    category: "mental",
    shortDescription: "Traditional number-based insight to support self-understanding.",
    details:
      "Numerology offers a traditional, number-based lens for self-reflection, used here as a complementary tool for insight rather than a diagnostic method.",
    sessionInvolves: [
      "Review of relevant personal numbers",
      "A guided, reflective conversation",
      "Takeaways for personal reflection",
    ],
  },
  {
    id: "handwriting",
    name: "Handwriting Analysis",
    category: "mental",
    shortDescription: "Traditional graphology used as a reflective, self-understanding tool.",
    details:
      "Handwriting Analysis (graphology) is offered as a traditional, reflective tool to explore personality tendencies and support self-understanding.",
    sessionInvolves: [
      "A short handwriting sample",
      "A guided, reflective review",
      "A conversation about the insights that come up",
    ],
  },
  {
    id: "healing-therapies",
    name: "Healing Therapies",
    category: "mental",
    shortDescription: "A personalized blend of holistic techniques suited to your emotional wellbeing.",
    details:
      "A personalized combination of holistic techniques, tailored to your emotional needs and drawn from the full range of practices offered at Sanjivini.",
    sessionInvolves: [
      "A personalized conversation about your goals",
      "A blended approach suited to your needs",
      "Ongoing guidance for continued balance",
    ],
  },
];

export const whyChoose = [
  {
    title: "Natural and Drug-Free Healing",
    description: "An approach rooted entirely in natural, holistic techniques.",
    icon: "leaf",
  },
  {
    title: "Personalized Therapy Sessions",
    description: "Every session is shaped around you — your goals, your pace.",
    icon: "hand-heart",
  },
  {
    title: "Physical & Energy Wellness",
    description: "Supporting balance across the body's physical and energetic systems.",
    icon: "sparkles",
  },
  {
    title: "Stress & Relaxation Support",
    description: "Calm, guided space to release tension and restore ease.",
    icon: "wind",
  },
  {
    title: "Suitable for Different Age Groups",
    description: "A gentle approach that welcomes clients across all stages of life.",
    icon: "users",
  },
] as const;

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  isPlaceholder: boolean;
}

/** Client reviews — every screen size (carousel on phones/tablets, three cards on desktop). */
export const testimonials: Testimonial[] = [
  {
    id: "m1",
    quote:
      "Anita’s work in acupressure is truly admirable and deeply appreciated. She demonstrates not only strong knowledge of the practice but also a genuine care for the well-being of others. Her techniques are effective and bring noticeable relief, reflecting both her skill and dedication.",
    name: "Bharati Santosh",
    isPlaceholder: false,
  },
  {
    id: "m2",
    quote:
      "I had a very good experience at Sanjivini Healing Hub Belgavi. Anita madam is very kind and patient. She listens carefully and gives the right healing therapy. I felt relaxed and positive after the session.",
    name: "Rahul Sankeshwar",
    isPlaceholder: false,
  },
  {
    id: "m3",
    quote:
      "I had very good experience at Sanjivini Healing Hub. Had a good therapy session with Anita mam. Felt very positive after this session. Very useful for health and body.",
    name: "Shreya Jadhav",
    isPlaceholder: false,
  },
];

export const contact = {
  // Shown on the page exactly as written.
  phoneDisplay: "7816832466",
  // Used for tap-to-call links (tel:+917816832466).
  phone: "+917816832466",
  email: "aanithaaajakkatiidivinesoul@gmail.com",
  // Not supplied yet — replace before launch.
  whatsapp: "PLACEHOLDER — add WhatsApp link",
  instagram: "https://www.instagram.com/aaj.780?stkn=MWYzbnN5dnBiMmRhdQ==", // @aaj.780
  address: "PLACEHOLDER — add location / address",
};

/**
 * Google reviews — the link behind the "Write a Google Review" button in the
 * strip under the testimonials.
 */
export const googleReviews = {
  // Opens Google's "Write a review" form for the Sanjivani Healing Hub
  // listing (Tilakwadi, Belagavi) directly — on phones it opens in Google
  // Maps. The Place ID identifies the listing.
  reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJV0QMXQBlvzsRXhYZGB0vnY8",
};

export const footerLine = "Heal Naturally • Live Happily";
