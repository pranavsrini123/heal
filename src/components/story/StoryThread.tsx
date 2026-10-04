import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { flowingPath, noise, smoothPath, type Point } from "./curves";
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

/**
 * Phones & tablets: content fills the width, so the thread never crosses
 * it. It sweeps out of the knot across the empty space below the hero,
 * then runs down the side margin (a hairline gutter beside the content),
 * changing sides only in the open gaps *between* sections. Early on it
 * wavers within the margin; further down it straightens and calms, until
 * it turns in, in the clear space under the About heading, to land on the
 * therapist's portrait.
 */
function compactPath({ w, sx, sy, ex, ey, blocks }: { w: number; sx: number; sy: number; ex: number; ey: number; blocks: Block[] }): Point[] {
  const pad = w >= 640 ? 32 : 20; // matches the px-5 / sm:px-8 content padding
  const gutter = pad * 0.45;
  const xOf = (side: number) => (side < 0 ? gutter : w - gutter);
  const span = ey - sy;
  const calmAt = (y: number) => 1 - clamp((y - sy) / span, 0, 1);
  const CLEAR = 14; // keep turns this far from any content block

  const pts: Point[] = [{ x: sx, y: sy }];
  // Start in whichever margin the knot's loose end leaves into.
  let side = sx > w / 2 ? 1 : -1;
  let y = sy;
  let wobble = 0;

  // Run straight-ish down the current gutter to `toY`, wavering a little
  // (more at the start of the journey, none near the end).
  const runTo = (toY: number) => {
    const len = toY - y;
    const calm = calmAt(y);
    const step = 90 + 220 * (1 - calm); // short, restless steps early; long, calm ones later
    const n = Math.floor(len / step);
    for (let i = 1; i <= n; i++) {
      const yy = y + (len * i) / (n + 1);
      const amp = Math.min(pad * 0.28, 6) * Math.pow(calmAt(yy), 1.6);
      wobble++;
      pts.push({ x: xOf(side) + (wobble % 2 ? amp : -amp), y: yy });
    }
    pts.push({ x: xOf(side), y: toY });
    y = toY;
  };

  const first = blocks[0];
  // 1. Out of the tangle beside the hero heading: the loose end already
  //    sits in the margin, so the thread simply carries on down it, past
  //    the hero text and buttons (the hero text is the first block).
  if (!first) runTo(sy + Math.min(140, span * 0.2));
  else if (first.top > sy + 40) runTo(first.top - CLEAR);

  // 2. Down the margin, switching sides in the gaps between sections.
  blocks.forEach((b, i) => {
    runTo(Math.max(y, b.bottom + CLEAR));
    const next = blocks[i + 1];
    if (!next) return;
    const gapTop = b.bottom + CLEAR;
    const gapBottom = next.top - CLEAR;
    if (gapBottom - gapTop >= 48) {
      side = -side;
      pts.push({ x: xOf(side), y: gapBottom });
      y = gapBottom;
    }
  });

  // 3. Arrival: stay in the margin past the centred heading, then turn in
  //    just above the frame and settle onto it.
  const turn = ey - 36;
  if (turn > y + 30) runTo(turn);
  pts.push({ x: ex, y: ey + 2 });
  return pts;
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
 * - Phones/tablets use a dedicated composition (see compactPath) that
 *   keeps to the side margin and only crosses the page between sections.
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

      let pts: Point[];
      if (mobile) {
        const blocks = Array.from(container.querySelectorAll("[data-thread-content]"))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { top: r.top - c.top, bottom: r.bottom - c.top };
          })
          .filter((b) => b.bottom > sy && b.bottom < ey);
        pts = compactPath({ w, sx, sy, ex, ey, blocks });
      } else {
        const step = Math.max(window.innerHeight * 0.62, 320);
        const n = Math.max(3, Math.round(span / step));
        const margin = 36;
        pts = [{ x: sx, y: sy }];

        for (let i = 1; i < n; i++) {
          // Points are closer together early on (a busier, more restless line)
          // and further apart later (longer, calmer curves).
          const t = Math.pow(i / n, 1.3);
          const calm = 1 - t;
          const y = sy + span * t;
          const base = sx + (ex - sx) * t;
          const swing = w * 0.3 * (0.35 + 0.65 * calm);
          const x = base + (i % 2 ? -1 : 1) * swing + noise(i) * w * 0.07 * calm * calm;
          pts.push({ x: clamp(x, margin, w - margin), y });
        }

        // A calm arrival: a near-vertical line settling onto the portrait.
        const approach = { x: ex, y: ey - Math.min(200, span * 0.12) };
        if (approach.y > pts[pts.length - 1].y + 40) pts.push(approach);
        pts.push({ x: ex, y: ey + 2 });
      }

      let d = flowingPath(pts);
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
    const samples = 700;
    const lengths = new Float32Array(samples + 1);
    const ys = new Float32Array(samples + 1);
    let maxY = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const len = (total * i) / samples;
      maxY = Math.max(maxY, path.getPointAtLength(len).y);
      lengths[i] = len;
      ys[i] = maxY;
    }
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
        strokeOpacity={geo.mobile ? 0.75 : 0.7}
        strokeWidth={geo.mobile ? 1.25 : 1.3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {!reduced && <circle ref={beadRef} r={geo.mobile ? 2.2 : 2.6} fill={GOLD} />}
    </svg>
  );
}
