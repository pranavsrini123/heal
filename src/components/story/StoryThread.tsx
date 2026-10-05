import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { smoothPath, type Point } from "./curves";
import { HEAD_BOX, START, STRANDS, type StrandTone } from "./mindHead";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * THE JOURNEY — confusion → healing → integration → clarity → balance.
 *
 * A figure sits in the hero: a head that is a ball of looping lines in
 * three muted colours (gold, terracotta, forest green), with a neck and
 * shoulders drawn as single fine lines. Its lines leave over the right
 * shoulder and flow down the page as separate, countable strands that
 * weave across one another, then converge and merge one by one:
 *
 *   hero ............... 3–4 lines, tangled
 *   Our Therapies ...... one merges into another → 2–3
 *   Why Choose ......... 2 calm lines
 *   Testimonials ....... the last two become one → 1–2
 *   Meet the Therapist . one line, in a colour blended from all three.
 *
 * The path is organic, not routed around the layout: one gently
 * meandering centre line is fitted once per layout — keeping clear of
 * text and buttons, free to pass behind the (opaque) cards — and smoothed
 * so it has no corners. Strands are offset from it horizontally, so every
 * strand only ever travels downward and can never fold back on itself.
 *
 * Everything is one SVG. The geometry is built once per real layout
 * change (never during scroll, and not when a phone's address bar
 * resizes the window); scrolling only moves each strand's dash offset.
 * Scrolling up reverses it, and prefers-reduced-motion shows it static.
 */

interface Strand {
  d: string;
  opacity: number;
  width: number;
  /** Dense polyline along the drawn path (for the scroll table). */
  pts: Point[];
  /** How many of `pts` belong to the head (drawn on load). */
  headCount: number;
  headTop: number;
  rampEnd: number;
  tone: StrandTone | "unity";
}

interface Geometry {
  w: number;
  h: number;
  strands: Strand[];
  heroBottom: number;
  /** Where the surviving line has become the blended colour. */
  unityFrom: number;
  unityTo: number;
}

interface LengthTable {
  total: number;
  lengths: Float32Array;
  ys: Float32Array;
}

interface Rect {
  l: number;
  r: number;
  t: number;
  b: number;
}

/** Each tone: [on the dark hero, on the cream sections]. */
const TONES: Record<StrandTone, [string, string]> = {
  gold: ["#d6ac5e", "#b5853a"],
  terra: ["#cf7a4c", "#a24f2b"],
  green: ["#8fa57f", "#4f6b4e"],
};
/** Terracotta, gold and forest green, integrated. */
const UNITY = "#8d6a3c";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
/** Piecewise-linear value through [y, v] stops. */
const through = (stops: [number, number][], y: number) => {
  if (y <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [y1, v1] = stops[i];
    const [y0, v0] = stops[i - 1];
    if (y <= y1) return v0 + ((v1 - v0) * (y - y0)) / (y1 - y0 || 1);
  }
  return stops[stops.length - 1][1];
};

/** Layout rect corrected for a CSS translate (entrance animations). */
function settledRect(el: Element, r: DOMRect | { left: number; right: number; top: number; bottom: number }) {
  const m = getComputedStyle(el as HTMLElement).transform;
  let tx = 0;
  let ty = 0;
  if (m && m !== "none") {
    const v = new DOMMatrixReadOnly(m);
    tx = v.m41;
    ty = v.m42;
  }
  return { left: r.left - tx, right: r.right - tx, top: r.top - ty, bottom: r.bottom - ty };
}

/** Extent of the actual text in an element (not its full-width box). */
function textRect(el: Element, transformed: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return settledRect(transformed, range.getBoundingClientRect());
}

/**
 * Where the figure is drawn (container coordinates) and its scale.
 * Desktop: inside the empty hero column (the old image area).
 * Phones/tablets: to the right of the heading — the head beside "Mind.",
 * the shoulders in the space below the heading — with its right side on
 * the page margin the strands leave by, clear of the eyebrow above and
 * the paragraph below.
 */
function placeHead(start: Element, c: DOMRect, mobile: boolean, gutterR: number) {
  if (!mobile) {
    const r = start.getBoundingClientRect();
    const k = Math.min((r.width * 0.84) / HEAD_BOX.w, (r.height * 0.92) / HEAD_BOX.h);
    const x0 = r.left - c.left + (r.width - HEAD_BOX.w * k) / 2 - HEAD_BOX.x * k;
    const y0 = r.bottom - c.top - 4 - START.y * k;
    return { k, x0, y0 };
  }
  const h1 = start;
  const lines = h1.children;
  const para = h1.nextElementSibling;
  if (lines.length < 2 || !para) return null;
  const fs = parseFloat(getComputedStyle(h1).fontSize);
  const l1 = textRect(lines[0], h1);
  const head = settledRect(h1, h1.getBoundingClientRect());
  const below = settledRect(para, para.getBoundingClientRect());
  const eyebrow = h1.previousElementSibling;
  const eyebrowBottom = eyebrow ? settledRect(eyebrow, eyebrow.getBoundingClientRect()).bottom : head.top - 24;
  const gap = Math.max(16, fs * 0.45);
  const right = gutterR + c.left;
  // The head (x 24–76 of the drawing) must clear the first heading line.
  const kX = (right - (l1.right + gap)) / (START.x - 24);
  const top = eyebrowBottom + 10;
  const bottom = below.top - 12;
  const kY = (bottom - top) / HEAD_BOX.h;
  const k = Math.min(kX, kY, fs * 0.05);
  if (k * HEAD_BOX.w < 60) return null;
  const x0 = right - START.x * k - c.left;
  const y0 = bottom - START.y * k - c.top;
  return { k, x0, y0 };
}

/** Dense points along the same Catmull–Rom spline smoothPath() draws. */
function splinePoints(points: Point[], tension: number, per: number): Point[] {
  const t = (1 - tension) * 0.5 + 0.25;
  const out: Point[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + ((p2.x - p0.x) * t) / 1.5, y: p1.y + ((p2.y - p0.y) * t) / 1.5 };
    const c2 = { x: p2.x - ((p3.x - p1.x) * t) / 1.5, y: p2.y - ((p3.y - p1.y) * t) / 1.5 };
    for (let k = 1; k <= per; k++) {
      const u = k / per;
      const v = 1 - u;
      out.push({
        x: v * v * v * p1.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * p2.x,
        y: v * v * v * p1.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * p2.y,
      });
    }
  }
  return out;
}

/**
 * Translation applied by entrance animations to an element or any of its
 * ancestors (up to the container) — so obstacles are measured where they
 * will settle, not where they start.
 */
function settleShift(el: Element, stop: Element, cache: Map<Element, [number, number]>): [number, number] {
  if (el === stop || !el.parentElement) return [0, 0];
  const hit = cache.get(el);
  if (hit) return hit;
  const [px, py] = settleShift(el.parentElement, stop, cache);
  const m = getComputedStyle(el).transform;
  let tx = px;
  let ty = py;
  if (m && m !== "none") {
    const v = new DOMMatrixReadOnly(m);
    tx += v.m41;
    ty += v.m42;
  }
  const res: [number, number] = [tx, ty];
  cache.set(el, res);
  return res;
}

interface FitOptions {
  w: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  mobile: boolean;
  /** Half-width of the strand bundle at a height. */
  spread: (y: number) => number;
  /** Text, buttons, images: the line keeps clear of these. */
  walls: Rect[];
  /** Opaque cards: the line may pass behind them. */
  cards: Rect[];
  /** The gentle meander the line would follow on an empty page. */
  pref: (y: number) => number;
}

/**
 * Fits the centre line: the cheapest downward path (a dynamic programme
 * over rows) that stays clear of the walls, leans towards the meander,
 * slightly prefers open space to running behind cards, and changes slope
 * gently — then smoothed. If smoothing ever pulls it into a wall, that
 * wall is given more room and the fit runs again.
 */
function fitCentreline(o: FitOptions) {
  const ROW = 16;
  const DX = o.mobile ? 3 : 6;
  const nRows = Math.max(2, Math.ceil((o.ey - o.sy) / ROW) + 1);
  const ys = Array.from({ length: nRows }, (_, j) => Math.min(o.ey, o.sy + j * ROW));
  const nx = Math.floor(o.w / DX) + 1;
  const K = Math.ceil((5 * ROW) / DX);
  const clear = o.mobile ? 5 : 16;
  const cardCost = o.mobile ? 0.1 : 0.15;
  const prefW = o.mobile ? 6 : 8;
  const slopeW = 6;
  const BLOCK = 1e6;
  const extra = new Float32Array(o.walls.length);
  const walls = o.walls.map((r, i) => ({ ...r, i })).sort((a, b) => a.t - b.t);
  const forcedStart = o.sy + 40;
  const forcedEnd = o.ey - (o.mobile ? 20 : 40);

  let X = new Float64Array(nRows);
  for (let iter = 0; iter < 4; iter++) {
    const back = new Int16Array(nRows * nx);
    let prev = new Float64Array(nx);
    let cur = new Float64Array(nx);
    const base = new Float64Array(nx);
    for (let j = 0; j < nRows; j++) {
      const y = ys[j];
      const sp = o.spread(y);
      base.fill(0);
      const forced = y <= forcedStart ? o.sx : y >= forcedEnd ? o.ex : null;
      if (forced !== null) {
        const fi = Math.round(forced / DX);
        for (let i = 0; i < nx; i++) base[i] = i === fi ? 0 : BLOCK * 10;
      } else {
        const p = o.pref(y);
        for (let i = 0; i < nx; i++) {
          const x = i * DX;
          if (x < sp + 2 || x > o.w - sp - 2) base[i] = BLOCK;
          else base[i] = prefW * ((x - p) / o.w) ** 2;
        }
        for (const wl of walls) {
          if (wl.t - clear > y + ROW / 2) break;
          if (wl.b + clear < y - ROW / 2) continue;
          const pad = sp + clear + extra[wl.i];
          const a = Math.max(0, Math.floor((wl.l - pad) / DX));
          const b = Math.min(nx - 1, Math.ceil((wl.r + pad) / DX));
          for (let i = a; i <= b; i++) base[i] += BLOCK;
        }
        for (const cd of o.cards) {
          if (cd.t > y || cd.b < y) continue;
          const a = Math.max(0, Math.floor(cd.l / DX));
          const b = Math.min(nx - 1, Math.ceil(cd.r / DX));
          for (let i = a; i <= b; i++) base[i] += cardCost;
        }
      }
      if (j === 0) {
        cur.set(base);
      } else {
        for (let i = 0; i < nx; i++) {
          let best = Infinity;
          let arg = i;
          const lo = Math.max(0, i - K);
          const hi = Math.min(nx - 1, i + K);
          for (let q = lo; q <= hi; q++) {
            const s = ((i - q) * DX) / ROW;
            const c = prev[q] + slopeW * s * s;
            if (c < best) {
              best = c;
              arg = q;
            }
          }
          cur[i] = best + base[i];
          back[j * nx + i] = arg;
        }
      }
      [prev, cur] = [cur, prev];
    }
    // Trace back the cheapest path.
    let i = 0;
    for (let q = 1; q < nx; q++) if (prev[q] < prev[i]) i = q;
    for (let j = nRows - 1; j >= 0; j--) {
      X[j] = i * DX;
      if (j > 0) i = back[j * nx + i];
    }
    // Smooth it into one continuous, calm curve.
    const pin = (arr: Float64Array) => {
      for (let j = 0; j < nRows; j++) {
        if (ys[j] <= forcedStart) arr[j] = o.sx;
        else if (ys[j] >= forcedEnd) arr[j] = o.ex;
      }
    };
    const R = o.mobile ? 4 : 6;
    for (let pass = 0; pass < 4; pass++) {
      const next = new Float64Array(nRows);
      for (let j = 0; j < nRows; j++) {
        let sum = 0;
        let wsum = 0;
        for (let d = -R; d <= R; d++) {
          const q = clamp(j + d, 0, nRows - 1);
          const wt = R + 1 - Math.abs(d);
          sum += X[q] * wt;
          wsum += wt;
        }
        next[j] = sum / wsum;
      }
      pin(next);
      X = next;
    }
    // Did smoothing pull it into a wall? Give that wall more room.
    let ok = true;
    for (let j = 0; j < nRows; j++) {
      const y = ys[j];
      if (y <= forcedStart || y >= forcedEnd) continue;
      const sp = o.spread(y);
      for (const wl of walls) {
        if (wl.t - clear * 0.5 > y) break;
        if (wl.b + clear * 0.5 < y) continue;
        const pad = sp + clear * 0.5;
        if (X[j] > wl.l - pad && X[j] < wl.r + pad) {
          extra[wl.i] += o.mobile ? 4 : 14;
          ok = false;
        }
      }
    }
    if (ok) break;
  }

  // Last resort for tight spots (a heading spanning a phone's width just
  // above the end): nudge any row still too close to a wall out to the
  // free side, then ease the nudge into its neighbours.
  for (let pass = 0; pass < 3; pass++) {
    for (let j = 0; j < nRows; j++) {
      const y = ys[j];
      if (y <= forcedStart || y >= forcedEnd) continue;
      const pad = o.spread(y) + clear * 0.6;
      for (const wl of walls) {
        if (wl.t - clear * 0.6 > y + ROW / 2) break;
        if (wl.b + clear * 0.6 < y - ROW / 2) continue;
        if (X[j] > wl.l - pad && X[j] < wl.r + pad) {
          const left = wl.l - pad;
          const right = wl.r + pad;
          X[j] = (X[j] - left < right - X[j] && left > pad) || right > o.w - pad ? left : right;
        }
      }
    }
    const next = new Float64Array(X);
    for (let j = 1; j < nRows - 1; j++) {
      if (ys[j] <= forcedStart || ys[j] >= forcedEnd) continue;
      next[j] = (X[j - 1] + 2 * X[j] + X[j + 1]) / 4;
    }
    X = next;
  }

  return (y: number) => {
    const f = clamp((y - o.sy) / ROW, 0, nRows - 1);
    const j = Math.floor(f);
    const u = f - j;
    return j >= nRows - 1 ? X[nRows - 1] : X[j] * (1 - u) + X[j + 1] * u;
  };
}

export function StoryThread({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const reduced = usePrefersReducedMotion();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const beadRef = useRef<SVGCircleElement>(null);
  const tables = useRef<LengthTable[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [ready, setReady] = useState(false);

  // The spring follows the scroll "tip" (a height on the page); every
  // strand reveals itself up to that height.
  const target = useMotionValue(0);
  const tip = useSpring(target, { stiffness: 38, damping: 18, mass: 0.7 });

  // 1. Build the geometry from the live layout; rebuild only when it changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timer = 0;
    let lastKey = "";

    const build = () => {
      const c = container.getBoundingClientRect();
      const w = c.width;
      const h = c.height;
      const mobile = w < 1024;
      const start = container.querySelector(mobile ? '[data-thread="start-compact"]' : '[data-thread="start"]');
      const end = container.querySelector('[data-thread="end"]');
      if (!start || !end) return;

      // The margin the figure stands on (phones) and the bundle's width.
      const gutterL = mobile ? (w >= 640 ? 32 : 20) * 0.45 : Math.max((w - 1280) / 2, 0) + 12;
      const gutterR = w - gutterL;
      const headAt = placeHead(start, c, mobile, gutterR);
      if (!headAt) return setGeo(null);
      const { k, x0, y0 } = headAt;
      const map = (p: Point) => ({ x: x0 + p.x * k, y: y0 + p.y * k });

      const sx = x0 + START.x * k;
      const sy = y0 + START.y * k;
      const e = end.getBoundingClientRect();
      // Phones: the heading above the portrait spans the screen, so the line
      // comes down the margin beside it and settles onto the portrait's
      // right edge, just below its top corner.
      const ex = mobile ? e.right - c.left - 3 : e.left - c.left + e.width / 2;
      const ey = e.top - c.top + (mobile ? 34 : 0);
      if (ey - sy < 300) return setGeo(null);

      const topOf = (id: string, fallback: number) => {
        const el = container.querySelector(`#${id}`);
        return el ? el.getBoundingClientRect().top - c.top : fallback;
      };
      const heroBottom = topOf("therapies", sy + 200);
      const yT = heroBottom;
      const yW = topOf("why-sanjivini", yT + 900);
      const yTe = topOf("testimonials", yW + 900);
      const yA = topOf("about", ey - 200);

      // What the line keeps clear of, and what it may pass behind.
      const CARDS = "#therapies li, #why-sanjivini .rounded-3xl, #testimonials .rounded-3xl";
      const cache = new Map<Element, [number, number]>();
      const rel = (r: { left: number; right: number; top: number; bottom: number }, el: Element): Rect => {
        const [tx, ty] = settleShift(el, container, cache);
        return { l: r.left - tx - c.left, r: r.right - tx - c.left, t: r.top - ty - c.top, b: r.bottom - ty - c.top };
      };
      const cards = Array.from(container.querySelectorAll(CARDS)).map((el) => rel(el.getBoundingClientRect(), el));
      const walls: Rect[] = [];
      container
        .querySelectorAll("h1, h2, h3, h4, p, span, a, button, img, figure, blockquote, svg, [data-thread-avoid]")
        .forEach((el) => {
          if (el.closest(CARDS) || el.closest('[data-thread="start"]') || el === end) return;
          if (el.parentElement === container && el.tagName.toLowerCase() === "svg") return;
          if (el.closest("svg") && el.closest("svg") !== el) return;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") return;
          const tag = el.tagName.toLowerCase();
          if (/^(h\d|p|span|blockquote)$/.test(tag)) {
            if (tag === "span" && !Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim()))
              return;
            const range = document.createRange();
            range.selectNodeContents(el);
            for (const r of Array.from(range.getClientRects())) if (r.width > 0 && r.height > 0) walls.push(rel(r, el));
          } else {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) walls.push(rel(r, el));
          }
        });

      // Strands: A (the figure, survives), then the thoughts.
      const heads = STRANDS.slice(0, mobile ? 3 : 4);
      const count = heads.length;
      const tipOff = heads.map((st) => (st.points[st.points.length - 1].x - START.x) * k);
      // Lanes once loosened: A at the centre, the others either side.
      const LANE = [0, -1, 1, -2];
      const PERIOD = mobile ? [210, 160, 185, 0] : [360, 270, 310, 420];
      const PHASE = [0, 2.1, 4.0, 1.2];
      const lead = mobile ? 90 : 220;
      const sepAt = (y: number) =>
        mobile
          ? through([[sy, 7], [yT, 9], [yW, 8], [yTe, 6], [ey, 4]], y)
          : through([[sy, 36], [yT, 28], [yW, 21], [yTe, 15], [ey, 10]], y);
      const tangle = (y: number) => 1 - smooth((y - sy) / (yW - sy));
      // When each thought merges into the surviving line (by height).
      const mergeAt: ([number, number] | null)[] = mobile
        ? [null, [yTe + (yA - yTe) * 0.3, yA - 40], [yT + (yW - yT) * 0.3, yW + 40]]
        : [null, [yTe + (yA - yTe) * 0.35, yA - 40], [yT + (yW - yT) * 0.45, yW + 60], [yT - 140, yT + 280]];
      const settleA: [number, number] = [yTe, ey - 80];

      const free = (i: number, y: number) => {
        const s = sepAt(y);
        const tg = tangle(y);
        const weave = Math.sin(((y - sy) / PERIOD[i]) * Math.PI * 2 + PHASE[i]);
        const o = s * (LANE[i] * (1 - 0.35 * tg) + 1.25 * tg * weave);
        const b = smooth((y - sy) / lead);
        return tipOff[i] * (1 - b) + o * b;
      };
      const offA = (y: number) => free(0, y) * (1 - smooth((y - settleA[0]) / (settleA[1] - settleA[0])));
      const offset = (i: number, y: number) => {
        if (i === 0) return offA(y);
        const m = mergeAt[i];
        const t = m ? smooth((y - m[0]) / (m[1] - m[0])) : 0;
        return free(i, y) * (1 - t) + offA(y) * t;
      };
      const ends = heads.map((_, i) => (mergeAt[i] ? mergeAt[i]![1] : ey));
      const spread = (y: number) => {
        let m = 1;
        for (let i = 0; i < count; i++) if (y <= ends[i]) m = Math.max(m, Math.abs(offset(i, y)));
        return m + 1;
      };

      // The meander: from the figure, gently across the page and back —
      // two unrelated waves, so it never repeats — and into the portrait.
      const amp = mobile ? 0.34 * w : 0.3 * Math.min(w, 1280);
      const ph = sx > w / 2 ? 1.25 : -1.25;
      // Phones approach the portrait down the margin beside its heading.
      const exPref = mobile ? Math.min(w - gutterL, ex + 30) : ex;
      const pref = (y: number) => {
        const t = y - sy;
        const wave =
          w / 2 +
          amp *
            (0.62 * Math.sin((t / (mobile ? 1500 : 2700)) * Math.PI * 2 + ph) +
              0.38 * Math.sin((t / (mobile ? 640 : 1150)) * Math.PI * 2 + 2.3));
        const a = smooth(t / 360);
        const b = smooth((ey - y) / 420);
        return (sx * (1 - a) + wave * a) * b + exPref * (1 - b);
      };

      // Phones: fit the line itself into the narrow margins; the strands
      // then draw together wherever the room is tight and part again after.
      const fitSpread = mobile ? (y: number) => Math.min(spread(y), 2.5) : spread;
      const X = fitCentreline({ w, sx, sy, ex, ey, mobile, spread: fitSpread, walls, cards, pref });
      const clearW = mobile ? 4 : 14;
      const sortedWalls = [...walls].sort((a, b) => a.t - b.t);
      const roomAt = (y: number) => {
        const x = X(y);
        let room = Math.min(x - 1, w - 1 - x);
        for (const wl of sortedWalls) {
          if (wl.t - clearW > y + 6) break;
          if (wl.b + clearW < y - 6) continue;
          if (wl.l - clearW > x) room = Math.min(room, wl.l - clearW - x);
          else if (wl.r + clearW < x) room = Math.min(room, x - wl.r - clearW);
          else room = 0;
        }
        return Math.max(0, room);
      };
      // Squeeze factor along the page, eased so the strands draw together
      // and part again gradually.
      const SQ = 8;
      const nSq = Math.ceil((ey - sy) / SQ) + 1;
      const raw = new Float32Array(nSq);
      for (let j = 0; j < nSq; j++) {
        const y = sy + j * SQ;
        raw[j] = y < sy + 40 || y > ey - 40 ? 1 : clamp(roomAt(y) / spread(y), 0.2, 1);
      }
      const R2 = mobile ? 8 : 6;
      const minF = raw.map((_, j) => {
        let m = 1;
        for (let d = -R2; d <= R2; d++) m = Math.min(m, raw[clamp(j + d, 0, nSq - 1)]);
        return m;
      });
      const sq = minF.map((_, j) => {
        let sum = 0;
        let n = 0;
        for (let d = -R2; d <= R2; d++) {
          sum += minF[clamp(j + d, 0, nSq - 1)];
          n++;
        }
        return sum / n;
      });
      const squeeze = (y: number) => {
        const f = clamp((y - sy) / SQ, 0, nSq - 1);
        const j = Math.floor(f);
        const u = f - j;
        return j >= nSq - 1 ? sq[nSq - 1] : sq[j] * (1 - u) + sq[j + 1] * u;
      };

      const STEP = 10;
      const strands: Strand[] = heads.map((st, i) => {
        const headMapped = st.points.map(map);
        const body: Point[] = [];
        const stop = ends[i];
        for (let y = sy; y < stop; y += STEP) body.push({ x: X(y) + offset(i, y) * squeeze(y), y });
        if (i === 0) body.push({ x: ex, y: ey + 2 });
        else body.push({ x: X(stop) + offset(i, stop) * squeeze(stop), y: stop });
        const all = [...headMapped.slice(0, -1), ...body];
        const headTop = Math.min(...headMapped.map((p) => p.y));
        const pts = splinePoints(all, 0.9, 4);
        return {
          d: smoothPath(all, 0.9),
          opacity: i === 0 ? 0.85 : 0.78,
          width: mobile ? (i === 0 ? 1.3 : 1.15) : i === 0 ? 1.6 : 1.4,
          pts,
          headCount: (headMapped.length - 1) * 4,
          headTop,
          rampEnd: Math.min(sy, Math.max(headTop + 40, window.innerHeight * 0.55)),
          tone: i === 0 ? "unity" : st.tone,
        };
      });

      setGeo({ w, h, strands, heroBottom, unityFrom: yTe, unityTo: yA });
    };

    // Rebuild on real layout changes only (debounced). A phone's address
    // bar changes the window's height, not the layout — ignore that.
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const r = container.getBoundingClientRect();
        const key = `${Math.round(r.width)}x${Math.round(r.height)}`;
        if (key === lastKey) return;
        lastKey = key;
        build();
      }, 120);
    };
    const force = () => {
      lastKey = "";
      schedule();
    };
    build();
    lastKey = `${Math.round(container.getBoundingClientRect().width)}x${Math.round(container.getBoundingClientRect().height)}`;
    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    document.fonts?.ready.then(force).catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [containerRef]);

  // 2. Scroll → the height the strands are revealed to.
  const updateRef = useRef<() => void>(() => undefined);
  updateRef.current = () => {
    const container = containerRef.current;
    if (!container || !tables.current.length) return;
    if (reduced) {
      target.jump(1e7);
      tip.jump(1e7);
      return;
    }
    target.set(window.innerHeight * 0.62 - container.getBoundingClientRect().top);
  };

  // 3. Per strand: map "revealed up to height Y" → drawn length, from the
  // strand's own points (no path measuring beyond its total length).
  useLayoutEffect(() => {
    if (!geo) return;
    tables.current = geo.strands.map((st, idx) => {
      const path = pathRefs.current[idx];
      if (!path) return { total: 0, lengths: new Float32Array(1), ys: new Float32Array(1) };
      const total = path.getTotalLength();
      const n = st.pts.length;
      const lengths = new Float32Array(n);
      const ys = new Float32Array(n);
      let acc = 0;
      for (let i = 1; i < n; i++) {
        acc += Math.hypot(st.pts[i].x - st.pts[i - 1].x, st.pts[i].y - st.pts[i - 1].y);
        lengths[i] = acc;
      }
      const scale = acc > 0 ? total / acc : 1;
      const headLen = lengths[Math.min(n - 1, Math.round(st.headCount))] || 1;
      // The head draws itself on arrival (heights ramp across the head),
      // then the strand follows the lowest point reached so far.
      let max = -Infinity;
      for (let i = 0; i < n; i++) {
        const y =
          lengths[i] <= headLen
            ? st.headTop + ((st.rampEnd - st.headTop) * lengths[i]) / headLen
            : Math.max(st.pts[i].y, st.rampEnd);
        max = Math.max(max, y);
        ys[i] = max;
        lengths[i] *= scale;
      }
      path.style.strokeDasharray = `${total} ${total}`;
      return { total, lengths, ys };
    });
    updateRef.current();
    paint(tip.get());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  useEffect(() => {
    const onScroll = () => updateRef.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // 4. Paint every strand up to the tip; the bead marks the main line's end.
  function paint(tipY: number) {
    tables.current.forEach((t, idx) => {
      const path = pathRefs.current[idx];
      if (!path || !t.total) return;
      let lo = 0;
      let hi = t.ys.length - 1;
      let l = 0;
      if (tipY > t.ys[0]) {
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (t.ys[mid] <= tipY) lo = mid;
          else hi = mid - 1;
        }
        l = lo >= t.ys.length - 1 ? t.total : t.lengths[lo];
      }
      path.style.strokeDashoffset = `${t.total - l}`;
      if (idx === 0 && beadRef.current) {
        const p = path.getPointAtLength(l);
        beadRef.current.setAttribute("cx", p.x.toFixed(1));
        beadRef.current.setAttribute("cy", p.y.toFixed(1));
        beadRef.current.style.opacity = l <= 0 || l >= t.total - 1 ? "0" : "1";
      }
    });
  }
  useMotionValueEvent(tip, "change", paint);

  if (!geo) return null;
  const hb = geo.heroBottom;
  const stop = (y: number) => clamp(y / geo.h, 0, 1);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[1] transition-opacity duration-700"
      width={geo.w}
      height={geo.h}
      viewBox={`0 0 ${geo.w} ${geo.h}`}
      fill="none"
      aria-hidden="true"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <defs>
        {(Object.keys(TONES) as StrandTone[]).map((tone) => (
          <linearGradient key={tone} id={`sj-thread-${tone}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={geo.h}>
            <stop offset={stop(hb - 60)} stopColor={TONES[tone][0]} />
            <stop offset={stop(hb + 60)} stopColor={TONES[tone][1]} />
          </linearGradient>
        ))}
        {/* The surviving line: gold at first, then — as the others join it —
            the colour of all three together. */}
        <linearGradient id="sj-thread-unity" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={geo.h}>
          <stop offset={stop(hb - 60)} stopColor={TONES.gold[0]} />
          <stop offset={stop(hb + 60)} stopColor={TONES.gold[1]} />
          <stop offset={stop(geo.unityFrom)} stopColor={TONES.gold[1]} />
          <stop offset={stop(geo.unityTo)} stopColor={UNITY} />
        </linearGradient>
      </defs>
      {geo.strands.map((st, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={st.d}
          stroke={`url(#sj-thread-${st.tone})`}
          strokeOpacity={st.opacity}
          strokeWidth={st.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {!reduced && <circle ref={beadRef} r={2.4} fill="url(#sj-thread-unity)" />}
    </svg>
  );
}
