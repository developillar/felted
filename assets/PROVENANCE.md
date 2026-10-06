# Felted asset provenance

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
