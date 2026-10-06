# Felted

An iOS-first React Native / TypeScript app built with Expo SDK 57. This milestone
implements the Glass Orbit table, The Night Shift club and The Reader collectible
as real, interactive components. The original design handoff is in `design/felted/`.

## Launch

Node 24 LTS is supplied by the cloud image. From `/workspace/felted`:

```bash
npm ci --no-audit --no-fund
npm run web -- --offline --max-workers 2
```

The browser runtime is used for cloud validation. The Expo shell helper directs
settings and caches to writable workspace locations and uses headless mode on
Linux, retaining Metro file watching. No application credentials or services are
required. Package installs use `registry.npmjs.org`; existing GitHub proxy
authentication reads the repository. The product domains are design suggestions.

For native review, run `npm run ios` on a Mac with Xcode and an iOS simulator, or
`npm start` and use a compatible Expo Go / development client. No bundle identifier
or Apple account identity has been selected. Native safe areas and the actual OS
status bar are used.

## Try the slice

- **Join table** starts the separate three-player playable seed. Call $4.60 moves
  the pot from $5.20 to $9.80; Jules' scripted call completes it at $14.40, with all
  three stacks at $95.20. Raise is a total street commitment with min/max validation.
- **Table menu → Developer preview** opens the immutable $14.90 visual fixture,
  every occupancy from 2–9, five-card river, long names, large amounts and the
  accessible player list. It also offers the separate Check / Bet demonstration.
  These controls are present only in development builds.
- **Collection → The Reader → Equip crest** saves the crest to device storage
  and displays it in the personal hand dock. Other collectibles are visibly locked.
- **Chat** supports local messages and four original line-art reactions. Mute,
  sound, haptics and Reduce Motion persist locally. The system's Reduce Motion
  preference is also respected. Preferences have an explicit storage-failure state.
- **Host a game** validates a name and 2–9 seat capacity, creates an empty local
  table and shows a clearly labeled device-only demo invitation.

Action submission locks immediately and shows pending/accepted/rejected states.
Folded seats remain visible. Money uses integer cents. The preview deadline is
120 seconds, derived from a timestamp; the product's actual turn duration remains
undecided. This is a fixture-driven demonstration, with no winner calculation,
side-pot resolution or production poker engine.

## Checks and evidence

```bash
npm run typecheck
npm test
npm run build:web -- --max-workers 2
bash scripts/expo.sh export --platform ios --output-dir /tmp/felted-ios-export --max-workers 2
npm run test:ui  # with the development server running
```

The browser review uses Python Playwright plus the cloud image's Chromium and
FFmpeg. It runs functional interactions, verifies all 2–9 player occupancies at
375×667, 390×844 and 430×932, checks seat/board collisions and touch-target sizes,
and captures screenshots and video into `artifacts/`. The delivered screenshots,
interaction recordings and result reports are checked in; scratch captures are ignored.
`FELTED_REVIEW_URL` can select a running development server.

See `artifacts/REVIEW.md` for the evidence inventory and review limitations.
Screenshots are actual browser rendering at logical iPhone sizes. iOS JavaScript
export is a bundling check; it does not demonstrate a native install or simulator
run. VoiceOver, device keyboards, native haptics/audio and real device safe areas
still need iOS validation.

## Structure

`src/components.tsx` contains reusable controls, cards, artwork views, tabs and
sheets. `src/screens.tsx` assembles the principal screens. `src/game.ts` owns the
deliberate action demonstration separately from rendering and the static fixture.
`src/layout.ts` computes stable seat geometry. `assets/PROVENANCE.md` documents the
original artwork, sound and licensed bundled font.

The next smallest iteration is a native iPhone review: correct safe-area, text
scaling and keyboard issues found there, then refine collectible cropping and
produce individual high-resolution art masters. Preserve this stack and the
working slice before adding later product milestones.
