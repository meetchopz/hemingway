import { mulberry32 } from "./prng";
import { Pt, smoothPath, polyline, line } from "./geometry";

export type ShapeKind = "yarn" | "boxes" | "maze" | "geo" | "freehand";
export type GeoVariant =
  | "spiral"
  | "rose"
  | "circle"
  | "wave"
  | "heart"
  | "lines";

export interface GenOpts {
  W: number;
  H: number;
  seed: number;
  density: number; // shape-specific "how many"
  scale: number; // 0..1 overall size
  randomness: number; // 0..1 jitter
  lineGap: number; // spacing between packed text lines (user units)
  variant: GeoVariant;
}

export function generatePaths(kind: ShapeKind, o: GenOpts): string[] {
  switch (kind) {
    case "yarn":
      return yarn(o);
    case "boxes":
      return boxes(o);
    case "maze":
      return maze(o);
    case "geo":
      return geo(o);
    default:
      return [];
  }
}

// ---------------------------------------------------------------- Yarn / tangle
function yarn(o: GenOpts): string[] {
  const rng = mulberry32(o.seed);
  const cx = o.W / 2;
  const cy = o.H / 2;
  const R = Math.min(o.W, o.H) * 0.42 * o.scale;
  const strands = Math.max(3, Math.round(o.density));
  const paths: string[] = [];

  for (let s = 0; s < strands; s++) {
    const rot = rng() * Math.PI;
    const rx = R * (0.45 + 0.55 * rng());
    const ry = R * (0.18 + 0.5 * rng());
    const jx = (rng() - 0.5) * R * 0.55 * o.randomness;
    const jy = (rng() - 0.5) * R * 0.55 * o.randomness;
    const N = 16;
    const pts: Pt[] = [];
    for (let k = 0; k < N; k++) {
      const t = (k / N) * Math.PI * 2;
      const wob = 1 + (rng() - 0.5) * 0.6 * o.randomness;
      const x = rx * Math.cos(t) * wob;
      const y = ry * Math.sin(t) * wob;
      const xr = x * Math.cos(rot) - y * Math.sin(rot);
      const yr = x * Math.sin(rot) + y * Math.cos(rot);
      pts.push({ x: cx + jx + xr, y: cy + jy + yr });
    }
    paths.push(smoothPath(pts, true));
  }

  // Trailing thread that escapes the ball toward the right edge.
  const ang = rng() * Math.PI * 2;
  const ex = cx + Math.cos(ang) * R * 0.9;
  const ey = cy + Math.sin(ang) * R * 0.9;
  const midx = (ex + o.W * 0.98) / 2;
  const midy = cy + (rng() - 0.5) * R * 0.4;
  paths.push(
    smoothPath(
      [
        { x: ex, y: ey },
        { x: midx, y: midy },
        { x: o.W * 0.99, y: cy + (rng() - 0.5) * R * 0.2 },
      ],
      false
    )
  );
  return paths;
}

// ------------------------------------------------------------- Isometric boxes
function boxes(o: GenOpts): string[] {
  const rng = mulberry32(o.seed);
  const grid = Math.max(1, Math.round(Math.sqrt(o.density)));
  const s = Math.min(o.W, o.H) * 0.16 * o.scale;
  const ux: Pt = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
  const uy: Pt = { x: -Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
  const uz: Pt = { x: 0, y: -1 };

  const paths: string[] = [];
  const cubes: { a: number; b: number; O: Pt; h: number }[] = [];
  for (let a = 0; a < grid; a++) {
    for (let b = 0; b < grid; b++) {
      const h = s * (0.7 + rng() * 1.1);
      const gx = (a - (grid - 1) / 2) * s;
      const gy = (b - (grid - 1) / 2) * s;
      const O: Pt = {
        x: o.W / 2 + gx * ux.x + gy * uy.x,
        y: o.H / 2 + gx * ux.y + gy * uy.y + s * grid * 0.25,
      };
      cubes.push({ a, b, O, h });
    }
  }
  // Painter's order: far cubes (small a+b) first so nearer ones layer on top.
  cubes.sort((c1, c2) => c1.a + c1.b - (c2.a + c2.b));

  for (const c of cubes) {
    const A: Pt = { x: ux.x * s, y: ux.y * s };
    const B: Pt = { x: uy.x * s, y: uy.y * s };
    const C: Pt = { x: uz.x * c.h, y: uz.y * c.h };
    const top: Pt = { x: c.O.x + C.x, y: c.O.y + C.y };
    // Top face (edges A, B), left face (edges B, C), right face (edges A, C).
    paths.push(...faceLines(top, A, B, o.lineGap));
    paths.push(...faceLines(c.O, B, C, o.lineGap));
    paths.push(...faceLines(c.O, A, C, o.lineGap));
  }
  return paths;
}

// Fill a parallelogram (corner p0, edges e1 & e2) with scanlines parallel to e1.
function faceLines(p0: Pt, e1: Pt, e2: Pt, gap: number): string[] {
  const len2 = Math.hypot(e2.x, e2.y);
  const n = Math.max(1, Math.floor(len2 / gap));
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    const start: Pt = { x: p0.x + e2.x * t, y: p0.y + e2.y * t };
    const endp: Pt = { x: start.x + e1.x, y: start.y + e1.y };
    out.push(line(start, endp));
  }
  return out;
}

// -------------------------------------------------------------------- Maze
function maze(o: GenOpts): string[] {
  const rng = mulberry32(o.seed);
  const gw = Math.max(2, Math.round(o.density));
  const gh = Math.max(2, Math.round((o.density * o.H) / o.W));
  const cell = Math.min((o.W * 0.9) / gw, (o.H * 0.9) / gh);
  const ox = (o.W - cell * gw) / 2 + cell / 2;
  const oy = (o.H - cell * gh) / 2 + cell / 2;

  const visited = new Array(gw * gh).fill(false);
  const idx = (x: number, y: number) => y * gw + x;
  const edges: [number, number, number, number][] = [];
  const stack: [number, number][] = [[0, 0]];
  visited[0] = true;

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const nbrs: [number, number][] = [];
    if (x > 0 && !visited[idx(x - 1, y)]) nbrs.push([x - 1, y]);
    if (x < gw - 1 && !visited[idx(x + 1, y)]) nbrs.push([x + 1, y]);
    if (y > 0 && !visited[idx(x, y - 1)]) nbrs.push([x, y - 1]);
    if (y < gh - 1 && !visited[idx(x, y + 1)]) nbrs.push([x, y + 1]);
    if (!nbrs.length) {
      stack.pop();
      continue;
    }
    const [nx, ny] = nbrs[Math.floor(rng() * nbrs.length)];
    visited[idx(nx, ny)] = true;
    edges.push([x, y, nx, ny]);
    stack.push([nx, ny]);
  }

  const center = (x: number, y: number): Pt => ({
    x: ox + x * cell,
    y: oy + y * cell,
  });
  return edges.map(([x, y, nx, ny]) => line(center(x, y), center(nx, ny)));
}

// -------------------------------------------------------------- Geometry set
function geo(o: GenOpts): string[] {
  const cx = o.W / 2;
  const cy = o.H / 2;
  const R = Math.min(o.W, o.H) * 0.42 * o.scale;

  switch (o.variant) {
    case "spiral": {
      const turns = Math.max(1, o.density / 3);
      const total = turns * Math.PI * 2;
      const steps = Math.ceil(total / 0.12);
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * total;
        const rr = (th / total) * R;
        pts.push({ x: cx + Math.cos(th) * rr, y: cy + Math.sin(th) * rr });
      }
      return [polyline(pts)];
    }
    case "rose": {
      const k = Math.max(2, Math.round(o.density / 2));
      const steps = 720;
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * Math.PI * 2;
        const rr = R * Math.cos(k * th);
        pts.push({ x: cx + Math.cos(th) * rr, y: cy + Math.sin(th) * rr });
      }
      return [polyline(pts)];
    }
    case "circle": {
      const rings = Math.max(1, Math.round(o.density / 3));
      const out: string[] = [];
      for (let i = 0; i < rings; i++) {
        const rr = R * (1 - i / Math.max(1, rings));
        if (rr < o.lineGap) break;
        out.push(circlePath(cx, cy, rr));
      }
      return out;
    }
    case "wave": {
      const cycles = Math.max(1, o.density / 2);
      const amp = R * 0.5;
      const w = o.W * 0.9;
      const steps = 300;
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push({
          x: o.W * 0.05 + t * w,
          y: cy + Math.sin(t * cycles * Math.PI * 2) * amp,
        });
      }
      return [polyline(pts)];
    }
    case "heart": {
      const steps = 400;
      const pts: Pt[] = [];
      const sc = R / 17;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y =
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t);
        pts.push({ x: cx + x * sc, y: cy - y * sc });
      }
      return [polyline(pts)];
    }
    case "lines":
    default: {
      const boxW = o.W * 0.9 * o.scale;
      const boxH = o.H * 0.9 * o.scale;
      const n = Math.max(1, Math.floor(boxH / o.lineGap));
      const x0 = cx - boxW / 2;
      const x1 = cx + boxW / 2;
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        const y = cy - boxH / 2 + (i + 0.5) * (boxH / n);
        out.push(line({ x: x0, y }, { x: x1, y }));
      }
      return out;
    }
  }
}

function circlePath(cx: number, cy: number, r: number): string {
  return (
    `M ${cx - r} ${cy} ` +
    `a ${r} ${r} 0 1 0 ${r * 2} 0 ` +
    `a ${r} ${r} 0 1 0 ${-r * 2} 0`
  );
}
