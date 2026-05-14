# FinalArtwork — Illustrator export script

`FinalArtwork.jsx` is an Adobe Illustrator ExtendScript that turns the
currently open working file into a complete final-artwork package.

For a working file called `MyJob.ai`, it produces a sibling folder
`MyJob_FinalArtwork/` containing:

| File | Purpose |
| ---- | ------- |
| `MyJob_OL.ai` | A copy of the file with **all text converted to outlines** (paths only). Safe to hand off without fonts. |
| `MyJob_Hires.pdf` | A press-ready PDF using Illustrator's `[High Quality Print]` preset (300 dpi color/gray, 1200 dpi mono). |
| `MyJob_LoRes_<n>_<artboard>.jpg` | A 50% scale, quality-60 JPEG for **each artboard** in the document. |

## Install

Copy `FinalArtwork.jsx` into Illustrator's `Scripts` presets folder, then
restart Illustrator:

- **macOS:** `/Applications/Adobe Illustrator <version>/Presets/<locale>/Scripts/`
- **Windows:** `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\<locale>\Scripts\`

It will then appear under **File → Scripts → FinalArtwork**.

To try it without installing, use **File → Scripts → Other Script…** and
pick `FinalArtwork.jsx` directly.

## Usage

1. Open your approved working `.ai` file and save it.
2. Run **File → Scripts → FinalArtwork**.
3. The three deliverables are written next to the source file inside
   `<filename>_FinalArtwork/`.

## Notes / caveats

- The script unlocks and shows all layers/items in the **outlined copy**
  before calling `createOutline()` so locked or hidden text still gets
  converted. The original master is never modified — Illustrator's
  `saveAs` switches focus to the new copy, and the script re-opens the
  master before continuing.
- The lo-res JPEG step writes one file per artboard. If you only have a
  single artboard you get a single `_LoRes_1_<name>.jpg`.
- Tweak the constants in `exportLoresJpg` (`qualitySetting`,
  `horizontalScale`, `verticalScale`) and `exportHiresPdf`
  (`colorDownsampling` etc.) if you need different output specs.
- Requires Illustrator CC or later (the script targets
  `Compatibility.ILLUSTRATOR17`).
