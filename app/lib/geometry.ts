export type Pt = { x: number; y: number };

// Build a smooth SVG path through points using a Catmull-Rom -> cubic Bezier conversion.
export function smoothPath(pts: Pt[], closed = false): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M ${r(pts[0].x)} ${r(pts[0].y)}`;
  if (n === 2)
    return `M ${r(pts[0].x)} ${r(pts[0].y)} L ${r(pts[1].x)} ${r(pts[1].y)}`;

  const get = (i: number) =>
    closed
      ? pts[((i % n) + n) % n]
      : pts[Math.max(0, Math.min(n - 1, i))];

  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`;
  const end = closed ? n : n - 1;
  for (let i = 0; i < end; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(p2.x)} ${r(p2.y)}`;
  }
  if (closed) d += " Z";
  return d;
}

// A straight polyline path (used for spirals/waves where we already sample densely).
export function polyline(pts: Pt[]): string {
  if (!pts.length) return "";
  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${r(pts[i].x)} ${r(pts[i].y)}`;
  return d;
}

export function line(a: Pt, b: Pt): string {
  return `M ${r(a.x)} ${r(a.y)} L ${r(b.x)} ${r(b.y)}`;
}

function r(v: number): number {
  return Math.round(v * 100) / 100;
}
