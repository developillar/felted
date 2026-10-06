# Artwork, fonts and provenance

The three PNGs under `references/` are newly rebranded Felted concept screenshots generated in this design conversation. They are guides for original implementation, not a layered design file or a set of ready-to-ship assets. The package does not contain isolated avatars, a 3D model, an app icon or audio. Those are the next art tasks, detailed here so their absence is not hidden.

## Included fonts

Ioskeley Mono v2.1.0, Normal / Unhinted, Regular, Medium and SemiBold. Original filenames are preserved. Source: https://github.com/ahatem/IoskeleyMono/releases/tag/v2.1.0 . License: SIL Open Font License 1.1; the complete original license is included at `assets/fonts/LICENSE.txt`. Preserve the license and notices when distributing the font. `source-metadata.json` records the downloaded source archive and original member paths.

The screenshot lettering is image-generated and approximate. The implementation must load the included font binaries; never trace screenshot letters as a substitute. The system sans is supplied by iOS at runtime.

## Production asset list

| Asset | Proposed delivery | Notes |
| --- | --- | --- |
| Eight starter avatar heads | Individual 1024×1024 transparent PNG masters; app-sized exports later | Consistent crop, scale and line weight; no UI circle baked into art |
| The Reader crest | Transparent 1024×1024 render, frontal and slight 3/4 | Reusable tiny gameplay and profile version |
| The Reader hero scene | 1600×2000 or larger portrait raster, no text | UI-safe upper/lower negative space; black edges |
| Club crest vignette | Wide transparent render or black-backed vignette | Crops independently from live text |
| Collection objects | Individual transparent renders | Proposed porcelain fox mask and obsidian dealer coin |
| Playing cards / suits / card back | Native/vector assets | Exact geometry and symbols; do not generate 52 raster UI cards |
| Navigation / action icons | One native/vector icon family | Consistent optical weight; card suits distinct from nav icons |
| Chips | Small restrained original sprite/vector set | Numeric pot is authoritative |
| Reaction art | Four small original line/ink assets | Nod, wave, applause, friendly laugh; local mute |
| Audio | Short licensed/original card, chip and success cues | Supply source/license; do not rip sounds from competitors |

Avatar identities: Theo — cap-wearing skater; Ava — purple hair/headphones; Rune — fox with dark glasses; Mina — rabbit; Sol — frog in knit hat; Nico — cloth ghost; Jules — rounded helmet; Hero — black cat in knit hat. Keep mature editorial ink styling, calm expressions and restrained accents. This identity list comes from the selected concepts, not from a requirement to reproduce a competitor’s exact characters.

Gameplay may use lightweight raster artwork. A realtime 3D collectible viewer is optional later; a beautifully rendered still with restrained motion is enough for the first milestone. Supply isolated art rather than clipping it out of an entire screen. If a source artifact supports clean extraction, keep its transparency and ownership clear; no screenshot text may be baked into production artwork.

## Ready-to-use generation briefs

### Avatar set — generate one head per asset

Use the corresponding head in `references/felted-table.png` as an identity and style reference. Create one original premium editorial ink avatar: [identity]. Fine controlled dark linework, matte shaded color, expressive but calm face, subtle paper/ink character, consistent front/three-quarter head crop. The entire head and headwear fit within a square transparent canvas. No background circle, border, label, number, badge or UI. No glossy plastic, photorealistic face, neon, exaggerated baby proportions or giant eyes. Match the other seven heads in scale and line weight. Deliver a transparent 1024×1024 PNG master.

### The Reader — isolated object

Use `references/felted-achievement.png` as the target material and silhouette. Render an original hollow spade sculpture in dense smoked optical glass with a round central aperture, softened asymmetric facets, restrained icy lavender and aqua internal refraction, a trace of warm rose and believable optical thickness. It should have physical weight and precise craftsmanship. Soft studio light. No text, stand, cave, sparkles or interface. Isolated on a truly transparent background with enough margin for the full object. Deliver a frontal 1024×1024 master; generate a second slight three-quarter view separately if needed.

### Achievement scene

Compose the same Reader sculpture on a short basalt plinth in a dark rock alcove. Rough dark stone contrasts with luminous clear glass. Scene blends into true black at the top and bottom so the real native heading and buttons remain readable. Keep the sculpture in the central portion, preserve generous empty areas for live UI, and keep side objects faint. No text, logos, labels, buttons, confetti, gold, blown-out neon or pre-rendered UI. Match the selected achievement reference’s lighting and object identity.

## Reference and rights notes

- Felted concept images: generated during this design collaboration; inspect outputs for fidelity before making production assets. No legal clearance or trademark search is implied.
- Ioskeley Mono: bundled from its official release with original license.
- Opal: visual inspiration only. Official source reviewed: https://brandkit.opal.so/ . No Opal media is bundled as a production asset.
- User inspiration post: https://x.com/linoleighton/status/2107340840544981395 . Its Opal video informed the material contrast and native UI restraint.
- Pure Poker: competitive reference provided by the user; no competitor artwork is included in this production handoff.
- Rebrand references were made with the built-in image-generation tool, preserving the selected layouts while changing FELTWELL to FELTED and removing study subtitles. Exact rebrand instructions are recorded in `references/GENERATION_NOTES.md`.

