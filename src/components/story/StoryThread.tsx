import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { smoothPath, type Point } from "./curves";
import { HEAD_BOX, NECK_CENTER_X, NECK_Y, PROFILE, THOUGHTS } from "./mindHead";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * THE JOURNEY — confusion → healing → clarity → balance.
 *
 * A mind drawn in a few fine lines (a profile and some intertwined loops of
 * thought) sits in the hero. Its lines flow out through the neck like veins
 * and travel down the page as a small bundle of strands — keeping to the
 * margin beside the content and crossing the page only in the open gaps
 * between sections, so they never run over text, buttons or cards.
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
}

interface Geometry {
  w: number;
  h: number;
  strands: Strand[];
}

interface LengthTable {
  total: number;
  lengths: Float32Array;
  ys: Float32Array;
}

interface Block {
  top: number;
  bottom: number;
}

/** A point on the route with its direction of travel (unit tangent). */
interface Node {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

const GOLD = "#c48a42"; // muted gold — between saffron and terracotta
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
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
 * Where the head is drawn (container coordinates) and its scale.
 * Desktop: inside the empty hero column (the old image area).
 * Phones/tablets: beside the hero heading, right-aligned to the content
 * edge, vertically centred on the two heading lines, clear of the eyebrow.
 */
function placeHead(start: Element, c: DOMRect, w: number, mobile: boolean) {
  if (!mobile) {
    const r = start.getBoundingClientRect();
    const k = Math.min((r.width * 0.78) / HEAD_BOX.w, (r.height * 0.86) / HEAD_BOX.h);
    const x0 = r.left - c.left + (r.width - HEAD_BOX.w * k) / 2 - HEAD_BOX.x * k;
    const y0 = r.bottom - c.top - 6 - NECK_Y * k;
    return { k, x0, y0 };
  }
  const h1 = start;
  const lines = h1.children;
  if (lines.length < 2) return null;
  const pad = w >= 640 ? 32 : 20;
  const fs = parseFloat(getComputedStyle(h1).fontSize);
  const l1 = textRect(lines[0], h1);
  const head = settledRect(h1, h1.getBoundingClientRect());
  const eyebrow = h1.previousElementSibling;
  const eyebrowBottom = eyebrow ? settledRect(eyebrow, eyebrow.getBoundingClientRect()).bottom : head.top - 24;
  const gap = Math.max(16, fs * 0.45);
  const right = w - pad;
  const roomX = right - (l1.right + gap);
  const roomY = head.bottom - 4 - (eyebrowBottom + 10);
  const width = Math.min(roomX, fs * 2.3, 96, (roomY * HEAD_BOX.w) / HEAD_BOX.h);
  if (width < 40) return null;
  const k = width / HEAD_BOX.w;
  const x0 = right - width - HEAD_BOX.x * k - c.left;
  const y0 = head.bottom - 4 - NECK_Y * k - c.top;
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
    const la = Math.abs(cx * a.tx + cy * a.ty) * 0.5;
    const lb = Math.abs(cx * b.tx + cy * b.ty) * 0.5;
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
  avoid: Block[];
  gutterL: number;
  gutterR: number;
  wobbleMax: number;
  /** Phones: the head sits beside the heading — step straight into the margin. */
  toGutterFirst: boolean;
}

/**
 * The centre line of the journey: down the margin beside the content,
 * crossing the page only in the gaps between sections, then a single
 * calm curve onto the therapist's portrait.
 */
function route(o: RouteOptions): Node[] {
  const { w, sx, sy, ex, ey, gutterL, gutterR } = o;
  const xOf = (side: number) => (side < 0 ? gutterL : gutterR);
  const span = ey - sy;
  const calmAt = (y: number) => 1 - clamp((y - sy) / span, 0, 1);
  const CLEAR = 12;

  const nodes: Node[] = [{ x: sx, y: sy, tx: 0, ty: 1 }];
  let side = sx > w / 2 ? 1 : -1;
  let y = sy;
  let wobble = 0;

  const runTo = (toY: number) => {
    const len = toY - y;
    if (len <= 0) return;
    const step = 110 + 220 * (1 - calmAt(y));
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

  // Cross the page inside a gap, switching margins.
  const cross = (gapBottom: number) => {
    for (const a of o.avoid) if (a.bottom > y && a.top < gapBottom) y = Math.max(y, a.bottom + CLEAR);
    const from = nodes[nodes.length - 1];
    const g = gapBottom - y;
    if (g < 44) return false;
    const to = -side;
    const xB = xOf(to);
    const dir = Math.sign(xB - from.x) || 1;
    const yMid = y + g * 0.5;
    const ax = from.x + (xB - from.x) * 0.5;
    nodes.push({ x: ax, y: yMid, tx: dir, ty: 0 });
    nodes.push({ x: xB, y: gapBottom, tx: 0, ty: 1 });
    side = to;
    y = gapBottom;
    return true;
  };

  if (o.toGutterFirst) {
    // A short S-curve from the neck into the margin, finished before the
    // caption under the heading begins.
    const drop = 12;
    nodes.push({ x: xOf(side), y: y + drop, tx: 0, ty: 1 });
    y += drop;
  } else {
    // Fall straight from the neck while the strands draw together, so the
    // turn that follows is smooth for every strand.
    const drop = 70;
    nodes.push({ x: sx, y: y + drop, tx: 0, ty: 1 });
    y += drop;
  }

  const inGutter = o.toGutterFirst || Math.abs(sx - xOf(side)) < 6;
  let blocks = o.blocks;
  if (!inGutter) blocks = blocks.filter((b) => b.top > y);
  const startsInside = blocks.length > 0 && blocks[0].top <= y;
  blocks.forEach((b, i) => {
    if (i === 0 && startsInside) {
      runTo(b.bottom + CLEAR);
      return;
    }
    if (!cross(b.top - CLEAR)) runTo(b.top - CLEAR);
    runTo(Math.max(y, b.bottom + CLEAR));
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
  return { pts: out, total };
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
      const headAt = placeHead(start, c, w, mobile);
      if (!headAt) return setGeo(null);
      const { k, x0, y0 } = headAt;
      const map = (p: Point) => ({ x: x0 + p.x * k, y: y0 + p.y * k });

      const sx = x0 + NECK_CENTER_X * k;
      const sy = y0 + NECK_Y * k;
      const e = end.getBoundingClientRect();
      const ex = e.left - c.left + e.width / 2;
      const ey = e.top - c.top;
      if (ey - sy < 300) return setGeo(null);

      const blocks = Array.from(container.querySelectorAll("[data-thread-content]"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top - c.top, bottom: r.bottom - c.top };
        })
        .filter((b) => b.bottom > sy && b.bottom < ey)
        .sort((p, q) => p.top - q.top);
      const avoid = Array.from(container.querySelectorAll("[data-thread-avoid]"))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0)
        .map((r) => ({ top: r.top - c.top, bottom: r.bottom - c.top }));

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

      const nodes = route({
        w,
        sx,
        sy,
        ex,
        ey,
        blocks,
        avoid,
        gutterL,
        gutterR: w - gutterL,
        wobbleMax: Math.max(0, half * 0.35),
        toGutterFirst: mobile,
      });
      const spine = sampleRoute(nodePath(nodes), 6);

      // Section heights that set the merge schedule.
      const sectionTops = blocks.filter((b) => b.top > sy + 20).map((b) => b.top);
      const [yT = sy + 400, yW = yT + 600, yTe = yW + 600, yA = ey - 120] = sectionTops;

      // Strands: A (profile, survives), then the thoughts.
      const thoughts = THOUGHTS.slice(0, mobile ? 2 : 3);
      const heads: Point[][] = [PROFILE, ...thoughts];
      const exits = heads.map((pts) => pts[pts.length - 1].x);
      const count = heads.length;
      // Where each strand sits in the bundle once it reaches the margin.
      const lane = exits.map((_, i) => (count === 1 ? 0 : -1 + (2 * i) / (count - 1)));
      // When each thought merges into the surviving line (by height).
      const mergeAt = mobile
        ? [null, [yTe - 60, yA - 40], [yT, yW - 20]]
        : [null, [yTe - 60, yA - 40], [yT + 40, yW - 20], [sy + 60, yT - 30]];
      const settleA: [number, number] = [yTe, ey - 60];

      const neckOffset = (i: number) => -(exits[i] - NECK_CENTER_X) * k; // along the normal (normal points left when heading down)
      const lead = mobile ? 60 : 80;
      const weaveLen = mobile ? 150 : 240;

      const offsetsFor = (i: number, s: number, y: number) => {
        const calm = 1 - clamp((y - sy) / (ey - sy), 0, 1);
        const intoBundle = smooth(s / lead);
        const free =
          -lane[i] * half * 0.6 + Math.sin((s / weaveLen) * Math.PI * 2 + i * 1.9) * half * 0.35 * calm * calm;
        return neckOffset(i) * (1 - intoBundle) + free * intoBundle;
      };

      const strands: Strand[] = heads.map((headPts, i) => {
        const headMapped = headPts.map(map);
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
              pts.push({ x: p.x + p.nx * o, y: p.y + p.ny * o });
              break;
            }
          }
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
          opacity: i === 0 ? (mobile ? 0.8 : 0.85) : mobile ? 0.6 : 0.62,
          width: i === 0 ? (mobile ? 1.15 : 1.35) : mobile ? 0.9 : 1.05,
          headTop,
          headLen: probe.total,
          rampEnd: Math.min(sy, Math.max(headTop + 40, window.innerHeight * 0.55)),
          main: i === 0,
        };
      });

      setGeo({ w, h, strands });
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
      {geo.strands.map((st, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={st.d}
          stroke={GOLD}
          strokeOpacity={st.opacity}
          strokeWidth={st.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {!reduced && <circle ref={beadRef} r={2.2} fill={GOLD} />}
    </svg>
  );
}
