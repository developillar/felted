# Felted asset provenance

The October 6 visual revision adds original vector felt, engraved chips, card
composition, stage transitions and payout effects, rendered as real components.
No screenshot is used as a screen background. Existing source art is preserved.

DM Sans and Instrument Serif come from the official Google Fonts repository,
under SIL OFL 1.1. Licenses are retained in `fonts/brand/`. DM Sans's official
variable TTF was instantiated at optical size 14 and weights 400, 500 and 700
using FontTools, for reliable static font loading on native and web. The
instances use unique Felted Sans PostScript names, avoiding registration conflicts
between weights on iOS. Instrument Serif Regular and Italic are the original
upstream static TTFs.

Web font files in `fonts/web/` are WOFF2 derivatives made with FontTools. Together
the eight files total 233,828 bytes. Brand fonts retain their complete glyph sets;
the three Ioskeley derivatives retain Latin, punctuation, currency symbols,
arrows and common math characters, and use the internal family name Felted Mono.
The original supplied Ioskeley TTFs and licenses remain unchanged for native use.
Metro includes WOFF2 as an asset format; web exports include only the compressed
font files, and iOS exports include only TTFs.

Sources:

- https://github.com/google/fonts/tree/main/ofl/dmsans
- https://github.com/google/fonts/tree/main/ofl/instrumentserif

Original app artwork was generated on October 6, 2026 with the image-generation
tool using the handoff's identity and material briefs. The reference screenshots
are design references; no screenshot crop is used as production UI or art. Text,
cards, labels, navigation and controls are real React Native components.

| File | Source and use |
| --- | --- |
| `art/avatars.png` | Original transparent 1774×887 atlas, eight editorial ink heads in 4×2 cells. Cells are selected at runtime; no UI is baked in. |
| `art/collectibles.png` | Original transparent 2172×724 atlas: Reader glass spade, porcelain fox mask, obsidian cat coin. |
| `art/reader-scene.png` | Original text-free 971×1619 glass spade / basalt alcove rendering. |
| `art/club-vignette.png` | Original text-free 1536×1024 vignette, left negative space for real headings. |
| `audio/card.wav`, `chip.wav`, `success.wav` | Original short synthesized tones, authored for this slice. No external samples. |
| `fonts/` | Ioskeley Mono v2.1.0 Regular, Medium and SemiBold, supplied with the handoff. SIL OFL 1.1 license and original source metadata are retained. |

Avatar cell order: Theo, Ava, Rune, Mina / Sol, Nico, Jules, Hero. A ninth occupied
preview seat named Luca reuses Theo's art. The eight starter identities are present;
an additional ninth unique portrait is a later polish asset.

Four curated reaction icons and all navigation/card suits are native vector or
text components. The Reader art also supplies the small equipped gameplay crest.
`favicon.svg` is an authored vector mark from the same original line-icon family;
`favicon.png` is its 256-pixel raster export for Expo's favicon pipeline.

Art refinement remaining: individual 1024×1024 transparent portrait masters,
a high-resolution isolated Reader and slight three-quarter view, and a scene
master at the brief's 1600×2000 target. Current generated art is original and
sufficient for the running slice; these exports do not satisfy those master-file
resolution targets. No temporary placeholder art or full-screen image UI is used.
