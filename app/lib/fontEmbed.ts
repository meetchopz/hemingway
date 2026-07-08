// Fetch the OTF fonts once and inline them as base64 @font-face rules so exported
// SVG/PNG files render with SC Prosper Sans without needing the font installed.
let cache: string | null = null;

export async function getFontCss(): Promise<string> {
  if (cache) return cache;
  const [reg, bold] = await Promise.all([
    fetch("/fonts/SCProsperSans-Regular.otf").then((r) => r.arrayBuffer()),
    fetch("/fonts/SCProsperSans-Bold.otf").then((r) => r.arrayBuffer()),
  ]);
  cache = [
    fontFace(400, reg),
    fontFace(700, bold),
  ].join("\n");
  return cache;
}

function fontFace(weight: number, buf: ArrayBuffer): string {
  return `@font-face{font-family:'SC Prosper Sans';font-style:normal;font-weight:${weight};src:url(data:font/otf;base64,${toBase64(buf)}) format('opentype');}`;
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return btoa(bin);
}
