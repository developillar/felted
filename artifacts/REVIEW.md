# Felted milestone 1 review

The three principal screens run as React Native components in Expo's browser
runtime. Artwork is original, and the supplied Ioskeley Mono fonts are bundled.

| Screen / state | Compact 375×667 | Standard 390×844 |
| --- | --- | --- |
| Club | [Screenshot](club-375x667.png) | [Screenshot](club-390x844.png) |
| The Reader, earned | [Screenshot](reader-375x667.png) | [Screenshot](reader-390x844.png) |
| Table, nine players / river | [Screenshot](table-9players-375x667.png) | [Screenshot](table-9players-390x844.png) |
| Table, heads-up | [Screenshot](table-2players-375x667.png) | [Screenshot](table-2players-390x844.png) |
| Table, six players | [Screenshot](table-6players-375x667.png) | [Screenshot](table-6players-390x844.png) |

Also included: [eight-player canonical static comparison](table-reference-390x844.png),
[validated raise sheet](raise-sheet-390x844.png),
[accepted call state](call-accepted-390x844.png),
[long names / large amounts](table-longnames-390x844.png),
[accessible player-list mode](table-accessible-list-390x844.png), and 430×932 captures.

[24-second interaction recording](interaction.mp4) shows the actual browser flow.
The [longer automated review recording](interaction-review.webm) is also included.
Machine-readable reports: [browser review](review-results.json) and
[published environment restoration](restoration-results.json).

## Verified in this machine

- Frozen `npm ci` completed; repeat installation preserved the dependency lockfile.
- TypeScript check passed. All 10 existing milestone state/layout tests passed,
  with zero failures or skips. They cover exact call/raise accounting, conservation
  of chips, amount validation, available actions, short-stack call wording,
  repeated-action rejection, stable seats and collision geometry.
- Production web export and iOS Hermes JavaScript export passed.
- All 14 browser review groups passed. The actual runtime exercised navigation,
  Call / Raise / Check / Bet / Fold, local hosting and its empty table state,
  collection detail, crest persistence, chat, reaction mute and saved preferences.
- Every occupancy from 2–9 was checked at 375×667, 390×844 and 430×932 with five
  cards. No seat/board collisions or offscreen actions were found. Tested table
  touch targets are at least 44 logical points.
- Long names and amounts expose full player detail. The simplified table exposes
  a readable player list. Browser review used `prefers-reduced-motion: reduce`.
- Nine critical token foreground/background pairs passed WCAG 4.5:1 contrast;
  the lowest measured ratio was 5.22:1 for hearts on cream card faces.
- No browser runtime or console errors occurred in the completed review.

The machine has no iOS simulator. Native installation, VoiceOver, device text
scaling, keyboard avoidance, haptics, audio and real iPhone safe areas remain
untested. Browser viewports do not demonstrate those native behaviors.

The art is present, but the brief's individual 1024-pixel avatar masters,
three-quarter Reader view and 1600×2000 scene master remain a refinement task.
See `../assets/PROVENANCE.md`. The nine-player layout reuses one starter portrait.

Next iteration: run this slice on a native iPhone, resolve issues from that review,
then refine art exports and collectible crop/lighting before adding a rules engine.
