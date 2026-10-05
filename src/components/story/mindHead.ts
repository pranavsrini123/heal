import type { Point } from "./curves";

/**
 * The "mind" at the start of the journey — a front-facing bust in a
 * 100 × 146 drawing box, after the reference sketch: the head is a ball of
 * looping lines (no outline), with a neck and shoulders drawn as single
 * fine lines.
 *
 * Strand A (gold) is the figure itself: it rises from the left side, over
 * the left shoulder and up the neck, loops through the head, then leaves
 * down the right side of the neck, over the right shoulder and down the
 * right side of the body — where the page-long journey continues it.
 *
 * Strands B (terracotta), C (forest green) and D (gold, desktop only) are
 * the thoughts: controlled loops inside the head that leave through the
 * neck and travel over the right shoulder beside A. Every strand ends at
 * the bottom of the right side, heading straight down; A survives to the
 * end and the others merge into it one by one as the visitor scrolls.
 */

export type StrandTone = "gold" | "terra" | "green";

export interface HeadStrand {
  tone: StrandTone;
  points: Point[];
}

/** Bottom of the right side — where the journey leaves the figure. */
export const START: Point = { x: 96, y: 140 };

const BALL = { x: 50, y: 40, r: 26 };

/**
 * Points on a drifting ellipse whose orientation slowly precesses — the
 * calm, deliberate loops of a ball of thread rather than a scribble.
 * Angles in degrees; the loop runs clockwise on screen.
 */
function loops(o: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  rotTo?: number;
  from: number;
  to: number;
  driftX?: number;
  driftY?: number;
  grow?: number;
}): Point[] {
  const pts: Point[] = [];
  const steps = Math.max(2, Math.round(Math.abs(o.to - o.from) / 30));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((o.from + (o.to - o.from) * t) * Math.PI) / 180;
    const r = ((o.rot + ((o.rotTo ?? o.rot) - o.rot) * t) * Math.PI) / 180;
    const s = 1 + (o.grow ?? 0) * (t - 0.5);
    const ex = Math.cos(a) * o.rx * s;
    const ey = Math.sin(a) * o.ry * s;
    pts.push({
      x: o.cx + (o.driftX ?? 0) * t + ex * Math.cos(r) - ey * Math.sin(r),
      y: o.cy + (o.driftY ?? 0) * t + ex * Math.sin(r) + ey * Math.cos(r),
    });
  }
  return pts;
}

/**
 * Leaves the head through the neck at x = `nx` and follows the right
 * shoulder `d` units inside strand A, ending `d` units left of START.
 */
function outRight(nx: number, d: number): Point[] {
  return [
    { x: nx, y: 68 },
    { x: nx + 0.4, y: 78 },
    { x: nx + 2.5, y: 86 + d * 0.2 },
    { x: 70 - d * 0.3, y: 93 + d * 0.8 },
    { x: 84 - d * 0.6, y: 100 + d * 0.7 },
    { x: 93 - d * 0.9, y: 110 + d * 0.3 },
    { x: 96 - d, y: 124 },
    { x: 96 - d, y: START.y },
  ];
}

/** From wherever a thought's last loop ends, curve gently into the neck. */
function glide(nx: number, d: number): Point[] {
  return [{ x: nx + 5, y: 60 }, ...outRight(nx, d)];
}

const A: Point[] = [
  { x: 4, y: START.y },
  { x: 4, y: 124 },
  { x: 7, y: 110 },
  { x: 16, y: 100 },
  { x: 30, y: 93 },
  { x: 40, y: 86 },
  { x: 43, y: 77 },
  { x: 43, y: 68 },
  // up into the head, around it, and down the right of the neck
  ...loops({ cx: 49, cy: 39, rx: 22, ry: 21, rot: -15, rotTo: 50, from: 125, to: 680, driftX: 3, driftY: 2, grow: -0.35 }),
  { x: 62, y: 60 },
  { x: 57, y: 68 },
  { x: 57, y: 78 },
  { x: 59.5, y: 86 },
  { x: 70, y: 93 },
  { x: 84, y: 100 },
  { x: 93, y: 110 },
  { x: 96, y: 124 },
  START,
];

const B: Point[] = [
  ...loops({ cx: 52, cy: 38, rx: 20, ry: 13, rot: -30, rotTo: 35, from: 200, to: 1055, driftX: 0, driftY: 6, grow: 0.1 }),
  ...glide(54, 3),
];

const C: Point[] = [
  ...loops({ cx: 48, cy: 42, rx: 14, ry: 22, rot: 35, rotTo: -25, from: 290, to: 1115, driftX: 4, driftY: -2, grow: -0.1 }),
  ...glide(51, 6),
];

const D: Point[] = [
  ...loops({ cx: 50, cy: 36, rx: 24, ry: 12, rot: 15, rotTo: -40, from: 10, to: 770, driftY: 8, grow: 0.05 }),
  ...glide(48, 9),
];

/** In merge order: A survives; B merges last, D (desktop only) first. */
export const STRANDS: HeadStrand[] = [
  { tone: "gold", points: A },
  { tone: "terra", points: B },
  { tone: "green", points: C },
  { tone: "gold", points: D },
];

/** Drawn extent of the figure (approximate, including spline overshoot). */
export const HEAD_BOX = { x: 0, y: BALL.y - BALL.r - 2, w: 100, h: START.y - (BALL.y - BALL.r - 2) };
