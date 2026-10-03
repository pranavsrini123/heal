import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { flowingPath, noise, smoothPath, type Point } from "./curves";
import { INLINE_BOX, KNOT_EXIT, KNOT_EXIT_INLINE, KNOT_TENSION, inlineKnotPoints } from "./TangledKnot";
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

const GOLD = "#c9a24e";
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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
      const exit = mobile ? KNOT_EXIT_INLINE : KNOT_EXIT;
      const sx = s.left - c.left + s.width * exit.x;
      const sy = s.top - c.top + s.height * exit.y;
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
      if (mobile) {
        // The tangle beside the hero heading is the first part of the very
        // same stroke: its loose end is exactly the journey's first point,
        // so knot and thread are one continuous path with no seam.
        const k = s.width / INLINE_BOX.size;
        const knot = inlineKnotPoints().map((p) => ({
          x: s.left - c.left + (p.x - INLINE_BOX.x) * k,
          y: s.top - c.top + (p.y - INLINE_BOX.y) * k,
        }));
        knot[knot.length - 1] = { x: sx, y: sy };
        d = `${smoothPath(knot, KNOT_TENSION)} ${d.replace(/^M [^C]+/, "")}`;
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
