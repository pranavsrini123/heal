import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { smoothPath, type Point } from "./curves";
import { KNOT_EXIT, KNOT_TENSION, knotLoopPoints } from "./TangledKnot";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Geometry {
  w: number;
  h: number;
  d: string;
  mobile: boolean;
}

interface LengthTable {
  total: number;
  lengths: Float32Array;
  ys: Float32Array;
}

const GOLD = "#c48a42"; // between muted gold and terracotta
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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

/** The knot's loops, starting on the first loop (no stray tail toward the type). */
const heroLoops = () => knotLoopPoints().slice(1);

/** True drawn extent of the loops (the spline overshoots its points). */
let loopBox: { x: number; y: number; w: number; h: number } | null = null;
function loopsBBox() {
  if (loopBox) return loopBox;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", smoothPath(heroLoops(), KNOT_TENSION));
  svg.appendChild(path);
  document.body.appendChild(svg);
  const b = path.getBBox();
  svg.remove();
  loopBox = { x: b.x, y: b.y, w: b.width, h: b.height };
  return loopBox;
}

/**
 * Phones/tablets: the tangle beside the hero heading, and the strand that
 * loosens out of it. Everything is measured from the rendered heading, so
 * it adapts to any width and font:
 *
 *  - the loops are sized from the heading's type size (so they never
 *    out-weigh it), right-aligned to the same edge as the buttons below,
 *    and vertically centred on the two-line heading — clear of the eyebrow
 *    above, with breathing room from the end of "Healing Mind.";
 *  - the strand unwinds from under the loops into the side margin and
 *    arrives there heading straight down — so the journey thread continues
 *    from it as one stroke.
 *
 * Returns the points (container coordinates) and where the strand ends.
 */
function heroTangle(h1: Element, c: DOMRect, w: number) {
  const lines = h1.children;
  if (lines.length < 2) return null;
  const pad = w >= 640 ? 32 : 20;
  const gutterX = w - pad * 0.45;
  const fs = parseFloat(getComputedStyle(h1).fontSize);
  const l1 = textRect(lines[0], h1);
  const head = settledRect(h1, h1.getBoundingClientRect());
  const eyebrow = h1.previousElementSibling;
  const eyebrowBottom = eyebrow ? settledRect(eyebrow, eyebrow.getBoundingClientRect()).bottom : head.top - 24;

  const box = loopsBBox();
  const ratio = box.h / box.w;
  const gap = Math.max(16, fs * 0.45); // breathing room from the type
  const right = w - pad; // the content edge — same as the buttons
  const roomX = right - (l1.right + gap);
  const roomY = head.bottom - 6 - (eyebrowBottom + 12);
  const width = Math.min(roomX, fs * 2.3, 100, roomY / ratio);
  if (width < 44) return null;
  const height = width * ratio;
  const k = width / box.w;
  const x0 = right - width;
  const mid = (head.top + head.bottom) / 2;
  const top = clamp(mid - height / 2, eyebrowBottom + 12, head.bottom - 6 - height);
  const map = (p: Point) => ({ x: x0 + (p.x - box.x) * k - c.left, y: top + (p.y - box.y) * k - c.top });
  const pts = heroLoops().map(map);

  // The loosening strand: a soft curl under the loops, then a rounded turn
  // out into the margin, where it settles into a vertical line. Once in the
  // margin it is beside (never over) the paragraph and buttons.
  const bottom = top + height;
  const turn = Math.max(12, fs * 0.38);
  pts.push(
    { x: x0 + width * 0.5 - c.left, y: bottom + 4 - c.top },
    { x: x0 + width * 0.8 - c.left, y: bottom + 4 + turn * 0.35 - c.top },
    { x: gutterX - 2 - c.left, y: bottom + 4 + turn * 1.2 - c.top },
    { x: gutterX - c.left, y: bottom + 4 + turn * 2.4 - c.top },
  );
  return { pts, exit: pts[pts.length - 1] };
}

interface Block {
  top: number;
  bottom: number;
}

/** A point on the thread with its direction of travel (unit tangent). */
interface Node {
  x: number;
  y: number;
  tx: number;
  ty: number;
  /** Part of a loop: sampled densely, joined with short handles. */
  dense?: boolean;
}

/**
 * Joins nodes with cubic Béziers whose handles follow each node's tangent.
 * For the long runs the handle length is half the distance travelled along
 * the tangent (so vertical runs stay vertical and turns stay inside the gap
 * they turn in); loop samples use short, chord-based handles. Every join is
 * tangent-continuous, so the whole journey reads as one smooth thread.
 */
function nodePath(nodes: Node[]): string {
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(nodes[0].x)} ${f(nodes[0].y)}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const cx = b.x - a.x;
    const cy = b.y - a.y;
    const dense = a.dense || b.dense;
    const chord = Math.hypot(cx, cy);
    const la = dense ? chord / 3 : Math.abs(cx * a.tx + cy * a.ty) * 0.5;
    const lb = dense ? chord / 3 : Math.abs(cx * b.tx + cy * b.ty) * 0.5;
    d += ` C ${f(a.x + a.tx * la)} ${f(a.y + a.ty * la)}, ${f(b.x - b.tx * lb)} ${f(b.y - b.ty * lb)}, ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

/**
 * How tangled the thread still is at each crossing between sections —
 * per loop: which side it swings to, its width/height (× r) and how far it
 * advances (× r; small = loops overlap). Irregular and knotted first, then
 * fewer, rounder, more open loops; after the third crossing, none.
 */
const CROSSINGS = [
  { side: [1, 1, -1], rx: [1, 0.72, 1.12], ry: [1.08, 0.7, 1.2], adv: [0.5, 0.62, 0.85] },
  { side: [1, 1], rx: [1, 1.18], ry: [0.92, 1.1], adv: [1.3, 1.55] },
  { side: [1], rx: [1.25], ry: [1.05], adv: [2.3] },
];
const MAX_RY = 1.2;

interface JourneyOptions {
  w: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  blocks: Block[];
  /** Small elements the crossings must pass below (e.g. the scroll cue). */
  avoid: Block[];
  gutterL: number;
  gutterR: number;
  wobbleMax: number;
  loopMaxR: number;
}

/**
 * The journey from the tangled mind to the therapist, as ONE thread.
 *
 * It keeps to the page margin beside the content and only crosses the page
 * in the open gaps between sections, so it never runs over text, buttons
 * or cards. The tangle loosens progressively down the page:
 *
 *   entering Our Therapies     — three tight, overlapping loops
 *   entering Why Choose        — two looser loops
 *   entering Testimonials      — one open loop
 *   entering Meet the Therapist — a single clean curve, settling onto the
 *                                 portrait.
 *
 * Wavering in the margin fades out on the same schedule.
 */
function journey(o: JourneyOptions): Node[] {
  const { w, sx, sy, ex, ey, gutterL, gutterR } = o;
  const xOf = (side: number) => (side < 0 ? gutterL : gutterR);
  const span = ey - sy;
  const calmAt = (y: number) => 1 - clamp((y - sy) / span, 0, 1);
  const CLEAR = 10; // stay this far from any content block

  const nodes: Node[] = [{ x: sx, y: sy, tx: 0, ty: 1 }];
  let side = sx > w / 2 ? 1 : -1;
  let y = sy;
  let wobble = 0;
  const inGutter = Math.abs(sx - xOf(side)) < 6;

  const runTo = (toY: number) => {
    const len = toY - y;
    if (len <= 0) return;
    const step = 90 + 220 * (1 - calmAt(y));
    const n = Math.floor(len / step);
    for (let i = 1; i <= n; i++) {
      const yy = y + (len * i) / (n + 1);
      const amp = o.wobbleMax * Math.pow(calmAt(yy), 1.6);
      wobble++;
      nodes.push({ x: xOf(side) + (wobble % 2 ? amp : -amp), y: yy, tx: 0, ty: 1 });
    }
    nodes.push({ x: xOf(side), y: toY, tx: 0, ty: 1 });
    y = toY;
  };

  // Cross the page inside a gap, switching margins, looping `k`-dependently.
  const cross = (gapBottom: number, crossing: number) => {
    const from = nodes[nodes.length - 1];
    // Start the crossing below anything sitting in this gap.
    for (const a of o.avoid) if (a.bottom > y && a.top < gapBottom) y = Math.max(y, a.bottom + CLEAR);
    const g = gapBottom - y;
    if (g < 48) return false;
    const to = -side;
    const xB = xOf(to);
    const dir = Math.sign(xB - from.x) || 1;
    const dist = Math.abs(xB - from.x);
    const yMid = y + g * 0.5;

    const style = CROSSINGS[crossing];
    let n = style ? style.side.length : 0;
    // Loops must fit the gap's height (they reach 2·ry·r to one side) and its width.
    const r = Math.min(o.loopMaxR, (g * 0.5 - 8) / (2 * MAX_RY));
    const advOf = (j: number) => (style ? style.adv[j] * r : 0);
    const lenOf = (count: number) => Array.from({ length: count }, (_, j) => advOf(j)).reduce((a, b) => a + b, 0);
    while (n > 0 && (r < 6 || lenOf(n) + 4 * r > dist * 0.8)) n--;

    const loopsLen = lenOf(n);
    const lead = (dist - loopsLen) / 2;
    const ax = from.x + dir * lead;
    nodes.push({ x: ax, y: yMid, tx: dir, ty: 0 });
    let px = ax;
    for (let j = 0; j < n && style; j++) {
      // Prolate trochoid: forward f(t) = h·t + rx·sin(2πt), side q(t) = s·ry·(1 − cos 2πt).
      const s = style.side[j];
      const advance = advOf(j);
      const rx = r * style.rx[j];
      const ry = r * style.ry[j];
      const SAMPLES = 18;
      for (let m = 1; m <= SAMPLES; m++) {
        const t = m / SAMPLES;
        const a = 2 * Math.PI * t;
        const fwd = advance * t + rx * Math.sin(a);
        const q = s * ry * (1 - Math.cos(a));
        const dfw = advance + 2 * Math.PI * rx * Math.cos(a);
        const dq = s * 2 * Math.PI * ry * Math.sin(a);
        const L = Math.hypot(dfw, dq) || 1;
        nodes.push({
          x: px + dir * fwd,
          y: yMid + q,
          tx: (dir * dfw) / L,
          ty: dq / L,
          dense: m < SAMPLES,
        });
      }
      px += dir * advance;
      // the last sample sits back on the line, heading forward again
      const last = nodes[nodes.length - 1];
      last.x = px;
      last.y = yMid;
      last.tx = dir;
      last.ty = 0;
    }
    nodes.push({ x: xB, y: gapBottom, tx: 0, ty: 1 });
    side = to;
    y = gapBottom;
    return true;
  };

  let blocks = o.blocks;
  if (!inGutter) blocks = blocks.filter((b) => b.top > sy);
  // The loop stage follows the section being entered (0 = Our Therapies),
  // so a gap too small for loops never shifts the later stages.
  const startsInside = blocks.length > 0 && blocks[0].top <= y;
  blocks.forEach((b, i) => {
    if (i === 0 && startsInside) {
      // The thread starts beside this block (phones: the hero text).
      runTo(b.bottom + CLEAR);
      return;
    }
    if (!cross(b.top - CLEAR, i - (startsInside ? 1 : 0))) runTo(b.top - CLEAR);
    runTo(Math.max(y, b.bottom + CLEAR));
  });

  // Arrival: clear now — stay in the margin past the heading, then turn in
  // just above the portrait and settle onto it.
  const turn = ey - 36;
  if (turn > y + 30) runTo(turn);
  nodes.push({ x: ex, y: ey + 2, tx: 0, ty: 1 });
  return nodes;
}

/**
 * One continuous thread running through the page: it picks up the loose
 * end of the tangled knot in the opening image and travels down through
 * the sections — busy and restless at first, then in longer, calmer
 * curves — until it arrives at the therapist's portrait.
 *
 * - Geometry is measured from the live layout ([data-thread="start"|"end"]),
 *   so it adapts to any screen size without stretching.
 * - It is drawn progressively: the tip follows a point ~60% down the
 *   viewport, eased with a slow spring.
 * - It keeps to the page margin and crosses only in the gaps between
 *   sections (see journey), loosening from tight loops to a clean line.
 * - It sits above section backgrounds but beneath all content (section
 *   content wrappers use z-[2]), so it passes behind text and cards.
 */
export function StoryThread({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const reduced = usePrefersReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGCircleElement>(null);
  const table = useRef<LengthTable | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [ready, setReady] = useState(false);

  const target = useMotionValue(0);
  const drawn = useSpring(target, { stiffness: 38, damping: 18, mass: 0.7 });

  // 1. Build the path from the current layout; rebuild whenever it changes.
  // (useEffect, not useLayoutEffect: the parent <main>'s ref is only
  // attached after child layout effects have run.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;

    const build = () => {
      const c = container.getBoundingClientRect();
      const w = c.width;
      const h = c.height;
      // Single-column layouts (phones and tablets, below the lg breakpoint)
      // get their own composition, starting from the tangle beside the hero
      // heading; the desktop path (from the framed image) is unchanged.
      const mobile = w < 1024;
      const start = container.querySelector(mobile ? '[data-thread="start-compact"]' : '[data-thread="start"]');
      const end = container.querySelector('[data-thread="end"]');
      if (!start || !end) return setGeo(null);

      const s = start.getBoundingClientRect();
      const e = end.getBoundingClientRect();
      const tangle = mobile ? heroTangle(start, c, w) : null;
      if (mobile && !tangle) return setGeo(null);
      const sx = tangle ? tangle.exit.x : s.left - c.left + s.width * KNOT_EXIT.x;
      const sy = tangle ? tangle.exit.y : s.top - c.top + s.height * KNOT_EXIT.y;
      const ex = e.left - c.left + e.width / 2;
      const ey = e.top - c.top;
      const span = ey - sy;
      if (span < 300) return setGeo(null);

      const blocks = Array.from(container.querySelectorAll("[data-thread-content]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top - c.top, bottom: r.bottom - c.top };
        })
        .filter((bl) => bl.bottom > sy && bl.bottom < ey)
        .sort((p, q) => p.top - q.top);

      // Margins: phones/tablets use the content padding; desktop the space
      // beside the centred max-w-7xl column.
      let gutterL: number;
      if (mobile) {
        const pad = w >= 640 ? 32 : 20;
        gutterL = pad * 0.45;
      } else {
        const contentLeft = Math.max((w - 1280) / 2, 0) + 32;
        gutterL = contentLeft - Math.min(40, contentLeft * 0.55);
      }
      const avoid = Array.from(container.querySelectorAll("[data-thread-avoid]"))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0)
        .map((r) => ({ top: r.top - c.top, bottom: r.bottom - c.top }));
      const nodes = journey({
        w,
        sx,
        sy,
        ex,
        ey,
        blocks,
        avoid,
        gutterL,
        gutterR: w - gutterL,
        wobbleMax: mobile ? Math.min((w >= 640 ? 32 : 20) * 0.28, 6) : Math.min(gutterL * 0.25, 14),
        loopMaxR: mobile ? (w >= 640 ? 22 : 16) : 34,
      });

      let d = nodePath(nodes);
      if (tangle) {
        // The tangle beside the hero heading is the first part of the very
        // same stroke: the strand's end is exactly the journey's first point,
        // so knot, strand and thread are one continuous path with no seam.
        d = `${smoothPath(tangle.pts, KNOT_TENSION)} ${d.replace(/^M [^C]+/, "")}`;
      }

      setGeo({ w, h, d, mobile });
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

  // 2. Map scroll position to how much of the thread is drawn.
  const updateRef = useRef<() => void>(() => undefined);
  updateRef.current = () => {
    const t = table.current;
    const container = containerRef.current;
    if (!t || !container) return;
    if (reduced) {
      target.jump(t.total);
      drawn.jump(t.total);
      return;
    }
    const tipY = window.innerHeight * 0.62 - container.getBoundingClientRect().top;
    // Largest sampled length whose height is above the tip (binary search).
    let lo = 0;
    let hi = t.ys.length - 1;
    if (tipY <= t.ys[0]) return target.set(0);
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (t.ys[mid] <= tipY) lo = mid;
      else hi = mid - 1;
    }
    target.set(t.lengths[lo]);
  };

  // 3. Sample the path once per geometry so scroll updates stay cheap.
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!geo || !path) return;
    const total = path.getTotalLength();
    const samples = Math.min(2400, Math.max(700, Math.round(total / 6)));
    const lengths = new Float32Array(samples + 1);
    const raw = new Float32Array(samples + 1);
    for (let i = 0; i <= samples; i++) {
      const len = (total * i) / samples;
      lengths[i] = len;
      raw[i] = path.getPointAtLength(len).y;
    }
    // Scroll → length uses the lowest point reached so far. Where the thread
    // doubles back (loops, crossings) that height stalls; spread each stall
    // over a little scroll distance so loops draw progressively, never as
    // a sudden burst.
    const ys = new Float32Array(samples + 1);
    let max = -Infinity;
    let runStart = 0;
    let runY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      if (raw[i] > max + 0.5) {
        if (i - runStart > 4) {
          const runLen = lengths[i - 1] - lengths[runStart];
          const lift = Math.min(70, runLen * 0.3);
          for (let k = runStart; k < i; k++) ys[k] = runY + (lift * (lengths[k] - lengths[runStart])) / (runLen || 1);
        }
        max = raw[i];
        runStart = i;
        runY = max;
      }
      ys[i] = max;
    }
    for (let i = 1; i <= samples; i++) ys[i] = Math.max(ys[i], ys[i - 1]);
    table.current = { total, lengths, ys };
    path.style.strokeDasharray = `${total} ${total}`;
    updateRef.current();
    paint(drawn.get());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  useEffect(() => {
    const onScroll = () => updateRef.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // 4. Paint: reveal the stroke and move the small bead at its tip.
  function paint(length: number) {
    const path = pathRef.current;
    const t = table.current;
    if (!path || !t) return;
    const l = clamp(length, 0, t.total);
    path.style.strokeDashoffset = `${t.total - l}`;
    const bead = beadRef.current;
    if (bead) {
      const p = path.getPointAtLength(l);
      bead.setAttribute("cx", p.x.toFixed(1));
      bead.setAttribute("cy", p.y.toFixed(1));
      bead.style.opacity = l >= t.total - 1 ? "0" : "1";
    }
  }
  useMotionValueEvent(drawn, "change", paint);

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
      <path
        ref={pathRef}
        d={geo.d}
        stroke={GOLD}
        strokeOpacity={geo.mobile ? 0.75 : 0.85}
        strokeWidth={geo.mobile ? 1.25 : 1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {!reduced && <circle ref={beadRef} r={geo.mobile ? 2.2 : 2.6} fill={GOLD} />}
    </svg>
  );
}
