"use client";

import { useRef, useState } from "react";

type Mode = "clarity" | "grammar" | "shorten" | "formal" | "casual";

const MODES: { id: Mode; label: string }[] = [
  { id: "clarity", label: "Clarity" },
  { id: "grammar", label: "Grammar Fix" },
  { id: "shorten", label: "Shorten" },
  { id: "formal", label: "More Formal" },
  { id: "casual", label: "More Casual" },
];

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function run(mode: Mode) {
    if (!input.trim() || loading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setActiveMode(mode);
    setLoading(true);
    setError(null);
    setOutput("");
    setCopied(false);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text: input }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "Request failed");
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Hemingway</h1>
        <p className="text-sm text-stone-600">
          Paste a draft, pick a mode, and Claude rewrites it.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const active = activeMode === m.id;
          const disabled = loading || !input.trim();
          return (
            <button
              key={m.id}
              onClick={() => run(m.id)}
              disabled={disabled}
              className={[
                "rounded-md border px-3 py-1.5 text-sm transition",
                active
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-800 hover:border-stone-500",
                disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {loading && active ? "…" : m.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-stone-700">Your draft</h2>
            <span className="text-xs text-stone-500">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your draft here…"
            className="min-h-[60vh] flex-1 resize-none rounded-md border border-stone-300 bg-white p-4 text-base leading-relaxed text-stone-900 outline-none focus:border-stone-500"
          />
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-stone-700">
              Rewrite{activeMode ? ` — ${labelFor(activeMode)}` : ""}
            </h2>
            <button
              onClick={copyOutput}
              disabled={!output || loading}
              className="text-xs text-stone-600 hover:text-stone-900 disabled:opacity-40"
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <div
            aria-live="polite"
            className="min-h-[60vh] flex-1 whitespace-pre-wrap rounded-md border border-stone-300 bg-white p-4 text-base leading-relaxed text-stone-900"
          >
            {output ||
              (loading ? (
                <span className="text-stone-400">Streaming…</span>
              ) : (
                <span className="text-stone-400">
                  Pick a mode to see the rewrite here.
                </span>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function labelFor(mode: Mode): string {
  return MODES.find((m) => m.id === mode)?.label ?? mode;
}
