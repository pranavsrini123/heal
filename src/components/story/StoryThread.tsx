import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { smoothPath, type Point } from "./curves";
import { HEAD_BOX, START, STRANDS, type StrandTone } from "./mindHead";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * THE JOURNEY — confusion → healing → clarity → balance.
 *
 * A figure sits in the hero: a head that is a ball of looping lines in
 * three muted colours (gold, terracotta, forest green), with a neck and
 * shoulders drawn as single fine lines. The lines flow out over the right
 * shoulder and down the page as a small bundle of strands — beside the
 * content, across the open gaps between sections and card rows, and (on
 * wide screens) straight down the gap between two columns of therapy
 * cards — never over text, buttons or cards. The strands are translucent,
 * so where two cross their colours mix (gold + green → olive, and so on).
 *
 * As the visitor scrolls, the strands merge into one another:
 *   hero ............... 3–4 lines (tangled, weaving)
 *   Our Therapies ...... one merges  → 2–3
 *   Why Choose ......... another     → 2
 *   Testimonials ....... the last    → 1–2
 *   Meet the Therapist . a single calm line, settling onto the portrait.
 *
 * Everything is one SVG, measured from the live layout, drawn by scroll
 * position (scrolling up reverses it) and fully static under
 * prefers-reduced-motion.
 */

interface Strand {
  d: string;
  opacity: number;
  width: number;
  /** Head portion (drawn on load); after it the strand follows the scroll. */
  headTop: number;
  headLen: number;
  rampEnd: number;
  main: boolean;
  tone: StrandTone;
}

interface Geometry {
  w: number;
  h: number;
  strands: Strand[];
  /** Where the dark hero ends: colours shift from their light to deep tone. */
  heroBottom: number;
}

interface LengthTable {
  total: number;
  lengths: Float32Array;
  ys: Float32Array;
}

interface Block {
  top: number;
  bottom: number;
  /** Space kept between the line and this block. */
  pad?: number;
  /** Wide screens: run straight down this x (a gap between card columns). */
  passX?: number;
  /** The only margin free beside this block (-1 left, 1 right). */
  side?: number;
}

/** A point on the route with its direction of travel (unit tangent). */
interface Node {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/** Each tone: [on the dark hero, on the cream sections]. */
const TONES: Record<StrandTone, [string, string]> = {
  gold: ["#d6ac5e", "#b5853a"],
  terra: ["#cf7a4c", "#a24f2b"],
  green: ["#8fa57f", "#4f6b4e"],
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** On the inside of a bend, keep a strand within most of the bend's radius — so no strand ever folds into a cusp. */
const hug = (o: number, bend: number) => (o * bend > 0.6 ? 0.6 / bend : o);
const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
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
 * the page margin the thread runs down, clear of the eyebrow above and
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

/**
 * Joins route nodes with cubic Béziers whose handles follow each node's
 * tangent (half the distance travelled along it), so vertical runs stay
 * vertical, turns stay inside the gap they turn in, and every join is
 * tangent-continuous.
 */
function nodePath(nodes: Node[]): string {
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(nodes[0].x)} ${f(nodes[0].y)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const cx = b.x - a.x;
    const cy = b.y - a.y;
    // Handles: half the distance travelled along the tangent — longer on
    // the short side of a crossing, so its turns stay wide and calm.
    const L = Math.hypot(cx, cy);
    const pa = Math.abs(cx * a.tx + cy * a.ty);
    const pb = Math.abs(cx * b.tx + cy * b.ty);
    const la = Math.max(pa * 0.5, Math.min(L * 0.35, pa * 0.9));
    const lb = Math.max(pb * 0.5, Math.min(L * 0.35, pb * 0.9));
    d += ` C ${f(a.x + a.tx * la)} ${f(a.y + a.ty * la)}, ${f(b.x - b.tx * lb)} ${f(b.y - b.ty * lb)}, ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

interface RouteOptions {
  w: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  blocks: Block[];
  avoid: { top: number; bottom: number; left: number; right: number }[];
  gutterL: number;
  gutterR: number;
  wobbleMax: number;
  /** Phones: the figure stands on the margin — no drop needed. */
  toGutterFirst: boolean;
}

/**
 * The centre line of the journey: down the margin beside the content,
 * crossing the page in the gaps between sections and card rows, straight
 * down a gap between card columns where one is given, then a single calm
 * curve onto the therapist's portrait.
 */
function route(o: RouteOptions): Node[] {
  const { w, sx, sy, ex, ey, gutterL, gutterR } = o;
  const xOf = (side: number) => (side < 0 ? gutterL : gutterR);
  const span = ey - sy;
  const calmAt = (y: number) => 1 - clamp((y - sy) / span, 0, 1);
  const CLEAR = 12;

  const nodes: Node[] = [{ x: sx, y: sy, tx: 0, ty: 1 }];
  let side = sx > w / 2 ? 1 : -1; // the last margin used
  let x = sx;
  let inPass = false;
  let y = sy;
  let wobble = 0;

  const runTo = (toY: number) => {
    const len = toY - y;
    if (len <= 0) return;
    const step = 110 + 220 * (1 - calmAt(y));
    const n = Math.floor(len / step);
    for (let i = 1; i <= n; i++) {
      const yy = y + (len * i) / (n + 1);
      const amp = inPass ? 0 : o.wobbleMax * Math.pow(calmAt(yy), 1.6);
      wobble++;
      nodes.push({ x: x + (wobble % 2 ? amp : -amp), y: yy, tx: 0, ty: 1 });
    }
    nodes.push({ x, y: toY, tx: 0, ty: 1 });
    y = toY;
  };

  // Move across the page inside a gap, to the x given.
  const cross = (gapBottom: number, toX: number) => {
    const from = nodes[nodes.length - 1];
    const dir = Math.sign(toX - from.x) || 1;
    const legs = (t: number): Node[] => [
      { x: from.x, y: t, tx: 0, ty: 1 },
      { x: from.x + (toX - from.x) * 0.5, y: (t + gapBottom) / 2, tx: dir, ty: 0 },
      { x: toX, y: gapBottom, tx: 0, ty: 1 },
    ];
    // Keep clear of anything marked to avoid (the hero's scroll cue):
    // start the crossing lower until its curve passes it.
    const hitsAvoid = (t: number) => {
      const d = nodePath(legs(t));
      const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      const pts: Point[] = [];
      for (let i = 2; i + 5 < nums.length; i += 6) {
        const [x0, y0] = i === 2 ? [nums[0], nums[1]] : [nums[i - 2], nums[i - 1]];
        for (let u = 0; u <= 1; u += 0.05) {
          const v = 1 - u;
          pts.push({
            x: v * v * v * x0 + 3 * v * v * u * nums[i] + 3 * v * u * u * nums[i + 2] + u * u * u * nums[i + 4],
            y: v * v * v * y0 + 3 * v * v * u * nums[i + 1] + 3 * v * u * u * nums[i + 3] + u * u * u * nums[i + 5],
          });
        }
      }
      return o.avoid.some((a) =>
        pts.some((p) => p.x > a.left - CLEAR - 20 && p.x < a.right + CLEAR + 20 && p.y > a.top - CLEAR - 20 && p.y < a.bottom + CLEAR + 20),
      );
    };
    let top = y;
    while (hitsAvoid(top) && gapBottom - top >= 22) top += 8;
    const g = gapBottom - top;
    if (g < 22) return false;
    if (top > y) runTo(top);
    const [, mid, end] = legs(top);
    nodes.push(mid, end);
    x = toX;
    y = gapBottom;
    return true;
  };

  if (!o.toGutterFirst) {
    // Fall straight down the side of the figure while the strands draw
    // together, so the turn that follows is smooth for every strand.
    const drop = 24;
    nodes.push({ x: sx, y: y + drop, tx: 0, ty: 1 });
    y += drop;
  }

  const inGutter = o.toGutterFirst || Math.abs(sx - xOf(side)) < 6;
  let blocks = o.blocks;
  if (!inGutter) blocks = blocks.filter((b) => b.top > y);
  const startsInside = blocks.length > 0 && blocks[0].top <= y;
  blocks.forEach((b, i) => {
    const pad = b.pad ?? CLEAR;
    if (i === 0 && startsInside) {
      runTo(b.bottom + pad);
      return;
    }
    if (b.passX !== undefined) {
      if (Math.abs(b.passX - x) < 3 || cross(b.top - pad, b.passX)) inPass = true;
    } else if (b.side !== undefined && !inPass && b.side === side && Math.abs(x - xOf(side)) < 3) {
      // Already beside it on the only free margin — stay.
    } else if (b.side !== undefined) {
      if (cross(b.top - pad, xOf(b.side))) {
        side = b.side;
        inPass = false;
      }
    } else if (inPass || Math.abs(x - xOf(side)) > 3) {
      // Out of a column gap (or off the figure): to the other margin.
      if (cross(b.top - pad, xOf(-side))) {
        side = -side;
        inPass = false;
      }
    } else if (cross(b.top - pad, xOf(-side))) {
      side = -side;
    }
    runTo(Math.max(y, b.bottom + pad));
  });

  const turn = ey - 36;
  if (turn > y + 30) runTo(turn);
  nodes.push({ x: ex, y: ey + 2, tx: 0, ty: 1 });
  return nodes;
}

/** Densely samples an SVG path string: points + unit normals. */
function sampleRoute(d: string, step: number) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const total = path.getTotalLength();
  const n = Math.max(2, Math.ceil(total / step));
  const out: { x: number; y: number; nx: number; ny: number; s: number }[] = [];
  let prev = path.getPointAtLength(0);
  for (let i = 0; i <= n; i++) {
    const s = (total * i) / n;
    const p = path.getPointAtLength(s);
    const q = path.getPointAtLength(Math.min(total, s + 1));
    let tx = q.x - p.x;
    let ty = q.y - p.y;
    if (i === n) {
      tx = p.x - prev.x;
      ty = p.y - prev.y;
    }
    const L = Math.hypot(tx, ty) || 1;
    tx /= L;
    ty /= L;
    out.push({ x: p.x, y: p.y, nx: -ty, ny: tx, s });
    prev = p;
  }
  svg.remove();
  // Signed curvature along the normal (positive: the curve bends towards
  // +normal), widened to the strongest bend nearby so it eases in and out.
  const raw = out.map((p, i) => {
    const a = out[Math.max(0, i - 1)];
    const b = out[Math.min(out.length - 1, i + 1)];
    const ds = b.s - a.s || 1;
    // tangent = (ny, -nx)
    const dtx = (b.ny - a.ny) / ds;
    const dty = (-b.nx + a.nx) / ds;
    return dtx * p.nx + dty * p.ny;
  });
  const W = Math.max(1, Math.round(36 / ((total / n) || 1)));
  const bend = raw.map((k, i) => {
    let m = 0;
    for (let j = Math.max(0, i - W); j <= Math.min(raw.length - 1, i + W); j++) if (Math.abs(raw[j]) > Math.abs(m)) m = raw[j];
    return m || k;
  });
  return { pts: out.map((p, i) => ({ ...p, bend: bend[i] })), total };
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

  // 1. Build the geometry from the live layout; rebuild when it changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;

    const build = () => {
      const c = container.getBoundingClientRect();
      const w = c.width;
      const h = c.height;
      const mobile = w < 1024;
      const start = container.querySelector(mobile ? '[data-thread="start-compact"]' : '[data-thread="start"]');
      const end = container.querySelector('[data-thread="end"]');
      if (!start || !end) return setGeo(null);
      // Margins and how wide the bundle of strands may be in them.
      let gutterL: number;
      let half: number;
      if (mobile) {
        const pad = w >= 640 ? 32 : 20;
        gutterL = pad * 0.45;
        half = (Math.min(gutterL, pad - gutterL) - 3) / 1.3;
      } else {
        const contentLeft = Math.max((w - 1280) / 2, 0) + 32;
        const toContent = Math.min(40, contentLeft * 0.55);
        gutterL = contentLeft - toContent;
        half = (Math.min(toContent, gutterL) - 3) / 1.3;
      }
      half = Math.max(3, Math.min(half, 18));
      const gutterR = w - gutterL;

      const headAt = placeHead(start, c, mobile, gutterR);
      if (!headAt) return setGeo(null);
      const { k, x0, y0 } = headAt;
      const map = (p: Point) => ({ x: x0 + p.x * k, y: y0 + p.y * k });

      const sx = x0 + START.x * k;
      const sy = y0 + START.y * k;
      const e = end.getBoundingClientRect();
      const ex = e.left - c.left + e.width / 2;
      const ey = e.top - c.top;
      if (ey - sy < 300) return setGeo(null);
      const hero = container.querySelector("#home");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom - c.top : sy + 200;

      const rel = (r: { top: number; bottom: number }) => ({ top: r.top - c.top, bottom: r.bottom - c.top });
      const sections = Array.from(container.querySelectorAll("[data-thread-content]"))
        .map((el) => ({ el, ...rel(el.getBoundingClientRect()) }))
        .filter((b) => b.bottom > sy && b.bottom < ey)
        .sort((p, q) => p.top - q.top);

      // Sections with card rows are split, so the line can pass between
      // the rows — and, where a row is laid out as one line of cards,
      // straight down a gap between two of them.
      const narrow: { top: number; bottom: number; half: number }[] = [];
      const blocks: Block[] = sections.flatMap(({ el, top, bottom }) => {
        const rows = Array.from(el.querySelectorAll("[data-thread-row]"));
        if (!rows.length || !el.firstElementChild) return [{ top, bottom }];
        const out: Block[] = [{ ...rel(el.firstElementChild.getBoundingClientRect()), pad: 6 }];
        for (const row of rows) {
          const rr = row.getBoundingClientRect();
          // Down to the cards' own bottom edge (the row's list has padding).
          const lastCard = row.querySelector("li");
          const b: Block = {
            top: rr.top - c.top,
            bottom: (lastCard ? lastCard.getBoundingClientRect().bottom : rr.bottom) - c.top,
            pad: 6,
          };
          const cards = Array.from(row.querySelectorAll("li")).map((li) => li.getBoundingClientRect());
          const oneLine =
            !mobile &&
            cards.length > 1 &&
            cards.every((r) => Math.abs(r.top - cards[0].top) < 2 && r.left >= c.left && r.right <= c.right);
          if (oneLine) {
            // Clear of the row's title and description.
            let textRight = -Infinity;
            row.querySelectorAll("h3, p").forEach((t) => {
              const r = textRect(t, t);
              if (r.bottom < cards[0].top) textRight = Math.max(textRight, r.right - c.left);
            });
            const mid = (cards[0].left + cards[cards.length - 1].right) / 2 - c.left;
            let best: { x: number; gw: number } | null = null;
            for (let i = 0; i < cards.length - 1; i++) {
              const gw = cards[i + 1].left - cards[i].right;
              const gx = (cards[i].right + cards[i + 1].left) / 2 - c.left;
              if (gw < 12 || gx - gw / 2 < textRight + 28) continue;
              if (!best || Math.abs(gx - mid) < Math.abs(best.x - mid) - 1) best = { x: gx, gw };
            }
            if (best) {
              b.passX = best.x;
              const zone = { top: b.top - 8, bottom: b.bottom + 8, half: Math.max(2, (best.gw / 2 - 4) / 1.3) };
              const last = narrow[narrow.length - 1];
              // Rows one above the other: stay drawn in across the gap.
              if (last && zone.top - last.bottom < 120) {
                last.bottom = zone.bottom;
                last.half = Math.min(last.half, zone.half);
              } else narrow.push(zone);
            }
          }
          if (!b.passX) {
            // A row that runs to the screen edge leaves only one margin free.
            const ul = row.querySelector("ul");
            const view = ul ? ul.getBoundingClientRect() : null;
            const hits = (gx: number) =>
              cards.some((r) => {
                const l = Math.max(r.left, view ? view.left : r.left) - c.left;
                const rr = Math.min(r.right, view ? view.right : r.right) - c.left;
                return rr > l && gx > l - half * 0.6 - 2 && gx < rr + half * 0.6 + 2;
              });
            const lHit = hits(gutterL);
            const rHit = hits(gutterR);
            if (lHit !== rHit) b.side = lHit ? 1 : -1;
          }
          out.push(b);
        }
        return out;
      });
      const avoid = Array.from(container.querySelectorAll("[data-thread-avoid]"))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0)
        .map((r) => ({ ...rel(r), left: r.left - c.left, right: r.right - c.left }));

      // The bundle draws in where it runs down a gap between cards.
      const halfAt = (y: number) => {
        let hv = half;
        for (const z of narrow) {
          const t = Math.min(smooth((y - (z.top - 36)) / 36), 1 - smooth((y - z.bottom) / 36));
          hv = Math.min(hv, half + (z.half - half) * t);
        }
        return hv;
      };

      const nodes = route({
        w,
        sx,
        sy,
        ex,
        ey,
        blocks,
        avoid,
        gutterL,
        gutterR,
        wobbleMax: Math.max(0, half * 0.35),
        toGutterFirst: mobile,
      });
      const spine = sampleRoute(nodePath(nodes), 6);

      // Section heights that set the merge schedule.
      const sectionTops = sections.filter((b) => b.top > sy + 20).map((b) => b.top);
      const [yT = sy + 400, yW = yT + 600, yTe = yW + 600, yA = ey - 120] = sectionTops;

      // Strands: A (the figure, survives), then the thoughts.
      const heads = STRANDS.slice(0, mobile ? 3 : 4);
      const tips = heads.map((st) => st.points[st.points.length - 1].x);
      const count = heads.length;
      // Where each strand sits in the bundle once it reaches the margin.
      const lane = tips.map((_, i) => (count === 1 ? 0 : -1 + (2 * i) / (count - 1)));
      // When each thought merges into the surviving line (by height).
      const mergeAt = mobile
        ? [null, [yTe - 60, yA - 40], [yT, yW - 20]]
        : [null, [yTe - 60, yA - 40], [yT + 40, yW - 20], [sy + 60, yT - 30]];
      const settleA: [number, number] = [yTe, ey - 60];

      // Offset along the normal (which points left when heading down).
      const tipOffset = (i: number) => -(tips[i] - START.x) * k;
      const lead = mobile ? 80 : 200;
      const weaveLen = mobile ? 150 : 240;

      const offsetsFor = (i: number, s: number, y: number) => {
        const calm = 1 - clamp((y - sy) / (ey - sy), 0, 1);
        const intoBundle = smooth(s / lead);
        const hv = halfAt(y);
        // Same order as at the figure (A outermost), so strands never cross here.
        const free = lane[i] * hv * 0.6 + Math.sin((s / weaveLen) * Math.PI * 2 + i * 1.9) * hv * 0.35 * calm * calm;
        return tipOffset(i) * (1 - intoBundle) + free * intoBundle;
      };

      const strands: Strand[] = heads.map((st, i) => {
        const headMapped = st.points.map(map);
        const pts: Point[] = [...headMapped.slice(0, -1)];
        const merge = mergeAt[i] as [number, number] | null;
        for (const p of spine.pts) {
          const oA = offsetsFor(0, p.s, p.y) * (1 - smooth((p.y - settleA[0]) / (settleA[1] - settleA[0])));
          let o: number;
          if (i === 0) o = oA;
          else {
            const m = merge ? smooth((p.y - merge[0]) / (merge[1] - merge[0])) : 0;
            o = offsetsFor(i, p.s, p.y) * (1 - m) + oA * m;
            if (merge && p.y >= merge[1]) {
              o = hug(o, p.bend);
              pts.push({ x: p.x + p.nx * o, y: p.y + p.ny * o });
              break;
            }
          }
          o = hug(o, p.bend);
          pts.push({ x: p.x + p.nx * o, y: p.y + p.ny * o });
        }
        // Decimate the sampled part a little; the spline smooths between.
        const head = pts.slice(0, headMapped.length - 1);
        const tail = pts.slice(headMapped.length - 1).filter((_, j, arr) => j % 3 === 0 || j === arr.length - 1);
        const all = [...head, ...tail];
        const headTop = Math.min(...headMapped.map((p) => p.y));
        // Length of the head portion, so it can draw itself on arrival.
        const probe = sampleRoute(smoothPath(headMapped, 0.9), 50);
        return {
          d: smoothPath(all, 0.9),
          opacity: i === 0 ? (mobile ? 0.8 : 0.85) : mobile ? 0.68 : 0.7,
          width: i === 0 ? (mobile ? 1.15 : 1.35) : mobile ? 0.95 : 1.1,
          headTop,
          headLen: probe.total,
          rampEnd: Math.min(sy, Math.max(headTop + 40, window.innerHeight * 0.55)),
          main: i === 0,
          tone: st.tone,
        };
      });

      setGeo({ w, h, strands, heroBottom });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule).catch(() => undefined);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
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

  // 3. Per strand: map "revealed up to height Y" → drawn length.
  useLayoutEffect(() => {
    if (!geo) return;
    tables.current = geo.strands.map((st, idx) => {
      const path = pathRefs.current[idx];
      if (!path) return { total: 0, lengths: new Float32Array(1), ys: new Float32Array(1) };
      const total = path.getTotalLength();
      const samples = Math.min(2400, Math.max(300, Math.round(total / 5)));
      const lengths = new Float32Array(samples + 1);
      const ys = new Float32Array(samples + 1);
      // The head draws itself on arrival (heights ramp across the head),
      // then the strand follows the lowest point reached so far.
      let max = -Infinity;
      for (let i = 0; i <= samples; i++) {
        const len = (total * i) / samples;
        lengths[i] = len;
        const y =
          len <= st.headLen
            ? st.headTop + ((st.rampEnd - st.headTop) * len) / (st.headLen || 1)
            : Math.max(path.getPointAtLength(len).y, st.rampEnd);
        max = Math.max(max, y);
        ys[i] = max;
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
        l = t.lengths[lo];
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
          <linearGradient
            key={tone}
            id={`sj-thread-${tone}`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={geo.heroBottom - 60}
            x2={0}
            y2={geo.heroBottom + 60}
          >
            <stop offset="0" stopColor={TONES[tone][0]} />
            <stop offset="1" stopColor={TONES[tone][1]} />
          </linearGradient>
        ))}
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
      {!reduced && <circle ref={beadRef} r={2.2} fill="url(#sj-thread-gold)" />}
    </svg>
  );
}
