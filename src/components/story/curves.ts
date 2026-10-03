export type Point = { x: number; y: number };

/**
 * Converts a list of points into one smooth SVG path (Catmull–Rom spline
 * expressed as cubic Béziers). `tension` 0–1: lower is rounder.
 */
export function smoothPath(points: Point[], tension = 0.5): string {
  if (points.length < 2) return "";
  const t = (1 - tension) * 0.5 + 0.25; // map to a pleasant control-arm length
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + ((p2.x - p0.x) * t) / 1.5, y: p1.y + ((p2.y - p0.y) * t) / 1.5 };
    const c2 = { x: p2.x - ((p3.x - p1.x) * t) / 1.5, y: p2.y - ((p3.y - p1.y) * t) / 1.5 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Joins points with S-curves whose handles are always vertical. Because
 * every handle sits between its segment's start and end heights, the path
 * only ever travels downward — which lets scroll position map cleanly to
 * how much of the thread is drawn.
 */
export function flowingPath(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dy = b.y - a.y;
    d += ` C ${a.x.toFixed(1)} ${(a.y + dy * 0.5).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - dy * 0.5).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

/** Small deterministic pseudo-random in [-1, 1], so the thread is identical on every visit. */
export function noise(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
