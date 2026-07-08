export type Seg = { t: string; hl: boolean };

// Repeat the base text enough times to comfortably exceed `targetLen` (a path
// length in user units), given the measured width of one repeat unit.
export function fillFor(base: string, unitWidth: number, targetLen: number): string {
  const clean = base.trim();
  if (!clean) return "";
  if (unitWidth <= 0) return clean + "   ";
  const count = Math.min(600, Math.max(1, Math.ceil(targetLen / unitWidth) + 2));
  return (clean + "   ").repeat(count);
}

// Split filled text into highlighted / normal segments based on keywords.
export function buildSegments(filled: string, keywords: string[]): Seg[] {
  const kws = keywords.map((k) => k.trim()).filter(Boolean);
  if (!kws.length || !filled) return filled ? [{ t: filled, hl: false }] : [];

  const escaped = kws
    .map(escapeRegex)
    .sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${escaped.join("|")})`, "gi");

  const segs: Seg[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(filled))) {
    if (m.index > last) segs.push({ t: filled.slice(last, m.index), hl: false });
    segs.push({ t: m[0], hl: true });
    last = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < filled.length) segs.push({ t: filled.slice(last), hl: false });
  return segs;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
