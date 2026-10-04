import type { Point } from "./curves";

/**
 * The "mind" at the start of the journey, in a 100 × 121 drawing box,
 * facing left (towards the hero text).
 *
 * Strand A is the profile — it rises from the back of the neck, over the
 * crown, down the brow, nose, lips and chin, and leaves through the front
 * of the neck. Strands B–D are the thoughts: a few controlled, intertwined
 * loops inside the head that unwind downwards through the neck.
 *
 * Every strand ends on the neck line (y = NECK_Y) heading straight down,
 * where the page-long journey continues it. Strand A survives to the end;
 * the others merge into it one by one as the visitor scrolls.
 */
export const NECK_Y = 121;
export const NECK_CENTER_X = 50.5;

export const PROFILE: Point[] = [
  { x: 63, y: 121 },
  { x: 63, y: 108 },
  { x: 67, y: 97 },
  { x: 76, y: 88 },
  { x: 81, y: 74 },
  { x: 82, y: 58 },
  { x: 78, y: 40 },
  { x: 68, y: 25 },
  { x: 54, y: 17 },
  { x: 40, y: 17 },
  { x: 29, y: 23 },
  { x: 23, y: 33 },
  { x: 21, y: 43 },
  { x: 17, y: 51 },
  { x: 13, y: 58 },
  { x: 16, y: 61 },
  { x: 19, y: 62 },
  { x: 18, y: 66 },
  { x: 20, y: 69 },
  { x: 19, y: 73 },
  { x: 22, y: 77 },
  { x: 28, y: 80 },
  { x: 34, y: 83 },
  { x: 37, y: 90 },
  { x: 38, y: 100 },
  { x: 39, y: 111 },
  { x: 40, y: NECK_Y },
];

/** The thoughts: larger loop, a smaller crossing loop, and (desktop) a third. */
export const THOUGHTS: Point[][] = [
  [
    { x: 40, y: 41 },
    { x: 45, y: 31 },
    { x: 58, y: 28 },
    { x: 68, y: 37 },
    { x: 67, y: 51 },
    { x: 56, y: 59 },
    { x: 45, y: 55 },
    { x: 42, y: 45 },
    { x: 49, y: 37 },
    { x: 60, y: 39 },
    { x: 63, y: 50 },
    { x: 58, y: 63 },
    { x: 52, y: 75 },
    { x: 48, y: 89 },
    { x: 47, y: 105 },
    { x: 47, y: NECK_Y },
  ],
  [
    { x: 66, y: 45 },
    { x: 71, y: 56 },
    { x: 65, y: 67 },
    { x: 53, y: 67 },
    { x: 47, y: 58 },
    { x: 53, y: 48 },
    { x: 63, y: 51 },
    { x: 62, y: 62 },
    { x: 57, y: 76 },
    { x: 55, y: 91 },
    { x: 54, y: 106 },
    { x: 54, y: NECK_Y },
  ],
  [
    { x: 35, y: 53 },
    { x: 41, y: 63 },
    { x: 51, y: 65 },
    { x: 55, y: 56 },
    { x: 49, y: 47 },
    { x: 39, y: 50 },
    { x: 37, y: 60 },
    { x: 45, y: 71 },
    { x: 55, y: 80 },
    { x: 59, y: 93 },
    { x: 60, y: 107 },
    { x: 61, y: NECK_Y },
  ],
];

/** Drawn extent of the head (approximate, including spline overshoot). */
export const HEAD_BOX = { x: 11, y: 15, w: 73, h: NECK_Y - 15 };
