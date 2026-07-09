"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  generatePaths,
  ShapeKind,
  GeoVariant,
} from "../lib/shapes";
import { Pt, smoothPath } from "../lib/geometry";
import { fillFor, buildSegments } from "../lib/textflow";
import { getFontCss } from "../lib/fontEmbed";

const W = 1200;
const H = 900;
const BG = "#0a1246";
const HALO = "#081245";
const INK = "#ffffff";
const HL = "#38d200";
const FONT = "SC Prosper Sans";

const SHAPES: { id: ShapeKind; label: string }[] = [
  { id: "yarn", label: "Yarn / Tangle" },
  { id: "boxes", label: "Iso Boxes" },
  { id: "maze", label: "Maze" },
  { id: "geo", label: "Geometry" },
  { id: "freehand", label: "Freehand" },
];

const GEO_VARIANTS: { id: GeoVariant; label: string }[] = [
  { id: "spiral", label: "Spiral" },
  { id: "rose", label: "Rose" },
  { id: "circle", label: "Rings" },
  { id: "wave", label: "Wave" },
  { id: "heart", label: "Heart" },
  { id: "lines", label: "Lines" },
];

const DEFAULT_TEXT =
  "We clear paths for capital that gets stuck between good intentions and the ground reality where the money actually needs to move and nobody agrees on what should happen next.";

export default function Studio() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [keywordsRaw, setKeywordsRaw] = useState("capital, paths, money");
  const [kind, setKind] = useState<ShapeKind>("yarn");
  const [variant, setVariant] = useState<GeoVariant>("spiral");

  const [density, setDensity] = useState(14);
  const [scale, setScale] = useState(0.9);
  const [randomness, setRandomness] = useState(0.5);
  const [lineGap, setLineGap] = useState(22);
  const [fontSize, setFontSize] = useState(14);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [bold, setBold] = useState(false);
  const [seed, setSeed] = useState(1234);
  const [showBg, setShowBg] = useState(true);
  const [halo, setHalo] = useState(0.4);

  // Freehand state
  const [strokes, setStrokes] = useState<Pt[][]>([[]]);
  const [closePath, setClosePath] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const [lengths, setLengths] = useState<number[]>([]);
  const [unitW, setUnitW] = useState(0);
  const [fontReady, setFontReady] = useState(false);

  const keywords = useMemo(
    () => keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean),
    [keywordsRaw]
  );

  const paths = useMemo(() => {
    if (kind === "freehand") {
      return strokes
        .filter((s) => s.length > 1)
        .map((s) => smoothPath(s, closePath));
    }
    return generatePaths(kind, {
      W,
      H,
      seed,
      density,
      scale,
      randomness,
      lineGap,
      variant,
    });
  }, [kind, variant, density, scale, randomness, lineGap, seed, strokes, closePath]);

  const unitSample = text.trim() + "   ";

  useEffect(() => {
    let alive = true;
    const fonts = (document as unknown as { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(() => {
      if (alive) setFontReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const nodes = svg.querySelectorAll("path[data-len]");
    const ls = Array.from(nodes).map((n) =>
      (n as SVGPathElement).getTotalLength()
    );
    const uw = measureRef.current
      ? measureRef.current.getComputedTextLength()
      : 0;
    setLengths(ls);
    setUnitW(uw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths, text, fontSize, letterSpacing, bold, fontReady]);

  function shuffle() {
    setSeed(1 + Math.floor(Math.random() * 9998));
  }

  // ---- Freehand interaction ----
  function toSvgPoint(evt: React.MouseEvent): Pt | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function onCanvasClick(evt: React.MouseEvent) {
    if (kind !== "freehand") return;
    const p = toSvgPoint(evt);
    if (!p) return;
    setStrokes((prev) => {
      const next = prev.map((s) => s.slice());
      if (!next.length) next.push([]);
      next[next.length - 1].push(p);
      return next;
    });
  }

  function newStroke() {
    setStrokes((prev) => [...prev, []]);
  }
  function undoPoint() {
    setStrokes((prev) => {
      const next = prev.map((s) => s.slice());
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].length) {
          next[i].pop();
          return next;
        }
      }
      return next;
    });
  }
  function clearStrokes() {
    setStrokes([[]]);
  }

  // ---- Export ----
  async function buildExportSvg(scaleUp: number): Promise<SVGSVGElement> {
    const svg = svgRef.current!;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[data-ui="1"]').forEach((n) => n.remove());
    clone.setAttribute("width", String(W * scaleUp));
    clone.setAttribute("height", String(H * scaleUp));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const css = await getFontCss();
    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    style.textContent = css;
    clone.insertBefore(style, clone.firstChild);
    return clone;
  }

  async function exportSvg() {
    const clone = await buildExportSvg(1);
    const str = new XMLSerializer().serializeToString(clone);
    saveBlob(
      new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + str], {
        type: "image/svg+xml",
      }),
      "concrete-poem.svg"
    );
  }

  async function exportPng() {
    const up = 2;
    const clone = await buildExportSvg(up);
    const str = new XMLSerializer().serializeToString(clone);
    const url = svgToDataUrl(str);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W * up;
      c.height = H * up;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      c.toBlob((b) => {
        if (b) saveBlob(b, "concrete-poem.png");
      }, "image/png");
    };
    img.src = url;
  }

  const densityLabel =
    kind === "yarn"
      ? "Strands"
      : kind === "boxes"
      ? "Cubes"
      : kind === "maze"
      ? "Maze size"
      : "Detail";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070c2c] text-slate-200">
      {/* Sidebar */}
      <aside className="flex w-[340px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/10 bg-[#0b1230] p-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Space Type
          </h1>
          <p className="text-xs text-slate-400">
            Concrete poetry generator · SC Prosper Sans
          </p>
        </div>

        <Field label="Text">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-md border border-white/10 bg-black/20 p-2 text-sm text-white outline-none focus:border-[#38d200]/60"
          />
        </Field>

        <Field label="Highlight keywords (comma separated)">
          <input
            value={keywordsRaw}
            onChange={(e) => setKeywordsRaw(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm text-white outline-none focus:border-[#38d200]/60"
            placeholder="capital, paths"
          />
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: HL }}
            />
            matches render in {HL}
          </div>
        </Field>

        <Field label="Shape">
          <div className="grid grid-cols-2 gap-1.5">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                onClick={() => setKind(s.id)}
                className={btn(kind === s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        {kind === "geo" && (
          <Field label="Variant">
            <div className="grid grid-cols-3 gap-1.5">
              {GEO_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={btn(variant === v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Field>
        )}

        {kind === "freehand" ? (
          <Field label="Freehand — click on the canvas to drop points">
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={newStroke} className={btn(false)}>
                New line
              </button>
              <button onClick={undoPoint} className={btn(false)}>
                Undo
              </button>
              <button onClick={clearStrokes} className={btn(false)}>
                Clear
              </button>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={closePath}
                onChange={(e) => setClosePath(e.target.checked)}
              />
              Close each path into a loop
            </label>
          </Field>
        ) : (
          <>
            <Slider
              label={densityLabel}
              min={kind === "maze" ? 3 : 1}
              max={kind === "boxes" ? 36 : 40}
              step={1}
              value={density}
              onChange={setDensity}
            />
            <Slider
              label="Scale"
              min={0.3}
              max={1}
              step={0.01}
              value={scale}
              onChange={setScale}
            />
            {kind === "yarn" && (
              <Slider
                label="Randomness"
                min={0}
                max={1}
                step={0.01}
                value={randomness}
                onChange={setRandomness}
              />
            )}
            {(kind === "boxes" ||
              (kind === "geo" &&
                (variant === "lines" || variant === "circle"))) && (
              <Slider
                label="Line spacing"
                min={8}
                max={44}
                step={1}
                value={lineGap}
                onChange={setLineGap}
              />
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Slider
                  label="Seed"
                  min={1}
                  max={9999}
                  step={1}
                  value={seed}
                  onChange={setSeed}
                />
              </div>
              <button onClick={shuffle} className={btn(false) + " mb-0.5"}>
                Shuffle
              </button>
            </div>
          </>
        )}

        <div className="h-px bg-white/10" />

        <Slider
          label="Font size"
          min={6}
          max={40}
          step={1}
          value={fontSize}
          onChange={setFontSize}
        />
        <Slider
          label="Letter spacing"
          min={-2}
          max={12}
          step={0.5}
          value={letterSpacing}
          onChange={setLetterSpacing}
        />
        <Slider
          label="Legibility (halo)"
          min={0}
          max={1}
          step={0.05}
          value={halo}
          onChange={setHalo}
        />
        <Field label="Weight">
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => setBold(false)} className={btn(!bold)}>
              Regular
            </button>
            <button onClick={() => setBold(true)} className={btn(bold)}>
              Bold
            </button>
          </div>
        </Field>

        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={showBg}
            onChange={(e) => setShowBg(e.target.checked)}
          />
          Navy background (uncheck for transparent export)
        </label>

        <div className="h-px bg-white/10" />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportSvg}
            className="rounded-md bg-[#38d200] px-3 py-2 text-sm font-medium text-[#0a1246] hover:brightness-95"
          >
            Export SVG
          </button>
          <button
            onClick={exportPng}
            className="rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Export PNG
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex flex-1 items-center justify-center overflow-auto p-6">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          onClick={onCanvasClick}
          className="h-auto max-h-full w-full max-w-[1200px] rounded-lg shadow-2xl ring-1 ring-white/10"
          style={{ cursor: kind === "freehand" ? "crosshair" : "default" }}
        >
          {showBg && <rect x={0} y={0} width={W} height={H} fill={BG} />}

          <defs>
            {paths.map((d, i) => (
              <path key={i} id={`tp${i}`} data-len d={d} fill="none" />
            ))}
          </defs>

          {/* Hidden text used to measure one repeat unit width. */}
          <text
            ref={measureRef}
            data-ui="1"
            x={-9999}
            y={-9999}
            fontFamily={FONT}
            fontSize={fontSize}
            fontWeight={bold ? 700 : 400}
            letterSpacing={letterSpacing}
            visibility="hidden"
          >
            {unitSample}
          </text>

          {paths.map((_, i) => {
            const target = lengths[i] ?? 1500;
            const filled = fillFor(text, unitW, target);
            const segs = buildSegments(filled, keywords);
            const haloOn = showBg && halo > 0;
            return (
              <text
                key={i}
                fontFamily={FONT}
                fontSize={fontSize}
                fontWeight={bold ? 700 : 400}
                letterSpacing={letterSpacing}
                fill={INK}
                stroke={haloOn ? HALO : undefined}
                strokeWidth={haloOn ? fontSize * halo : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ paintOrder: "stroke" }}
              >
                <textPath href={`#tp${i}`} startOffset={0}>
                  {segs.map((s, j) =>
                    s.hl ? (
                      <tspan key={j} fill={HL}>
                        {s.t}
                      </tspan>
                    ) : (
                      <tspan key={j}>{s.t}</tspan>
                    )
                  )}
                </textPath>
              </text>
            );
          })}

          {/* Freehand editing points (not exported). */}
          {kind === "freehand" && (
            <g data-ui="1">
              {strokes.flatMap((s, si) =>
                s.map((p, pi) => (
                  <circle
                    key={`${si}-${pi}`}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={HL}
                    opacity={0.85}
                  />
                ))
              )}
            </g>
          )}
        </svg>
      </main>
    </div>
  );
}

// ---------- small UI helpers ----------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#38d200]"
      />
    </div>
  );
}

function btn(active: boolean): string {
  return [
    "rounded-md border px-2 py-1.5 text-xs transition",
    active
      ? "border-[#38d200] bg-[#38d200]/15 text-white"
      : "border-white/10 bg-black/20 text-slate-300 hover:border-white/30",
  ].join(" ");
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function svgToDataUrl(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return "data:image/svg+xml;base64," + btoa(bin);
}
