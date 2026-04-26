import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic();

type Mode = "clarity" | "grammar" | "shorten" | "formal" | "casual";

const SYSTEM_PROMPTS: Record<Mode, string> = {
  clarity:
    "You are a writing editor focused on clarity. Rewrite the user's text to be clearer and more direct. Simplify complex sentences, cut jargon, and improve flow. Preserve the author's voice, tone, and meaning. Output ONLY the rewritten text — no preamble, no explanation, no quotation marks, no commentary.",
  grammar:
    "You are a copy editor. Fix grammar, spelling, and punctuation errors in the user's text. Make minimal changes — preserve the author's voice, style, and word choices wherever possible. Do not rewrite for style; only correct errors. Output ONLY the corrected text — no preamble, no explanation, no quotation marks, no commentary.",
  shorten:
    "You are a writing editor focused on conciseness. Rewrite the user's text to be shorter while preserving its meaning. Cut filler, redundancy, and weak phrases. Aim for roughly 60-70% of the original length. Output ONLY the shortened text — no preamble, no explanation, no quotation marks, no commentary.",
  formal:
    "You are a writing editor. Rewrite the user's text in a more formal, professional tone suitable for business or academic contexts. Replace contractions, slang, and casual phrasing with formal alternatives. Preserve the meaning. Output ONLY the rewritten text — no preamble, no explanation, no quotation marks, no commentary.",
  casual:
    "You are a writing editor. Rewrite the user's text in a more casual, conversational tone. Use contractions, simpler words, and a friendlier voice. Preserve the meaning. Output ONLY the rewritten text — no preamble, no explanation, no quotation marks, no commentary.",
};

export async function POST(req: Request) {
  let body: { mode?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { mode, text } = body;
  if (!mode || !(mode in SYSTEM_PROMPTS)) {
    return new Response("Invalid mode", { status: 400 });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return new Response("Missing text", { status: 400 });
  }

  const system = SYSTEM_PROMPTS[mode as Mode];
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          system: [
            {
              type: "text",
              text: system,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: text }],
        });

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n\n[error: ${message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
