# Acceptance checks for milestone 1

These are completion criteria for the future implementation. No app was built or tested as part of preparing this handoff.

## Visual fidelity

- [ ] Felted / FELTED appears everywhere appropriate; no old product name or numbered design-study subtitle remains.
- [ ] Actual bundled Ioskeley Mono renders amounts and short UI labels; system sans is used consistently for longer copy and headings.
- [ ] The table is the selected table-free horseshoe. No oval rail, rock board surface, neon, gold trim or casino room has been reintroduced.
- [ ] Avatars are one consistent editorial ink family, not a mixture of glossy toys and portraits.
- [ ] Board and amounts are the first readable game information. The personal dock feels distinct but does not dominate the board.
- [ ] Charcoal panels, lavender action color, corner treatment and icon family agree across table, club and collection.
- [ ] Glass sculpture is small in gameplay and rich in achievement view. No achievement overlay appears during a decision.
- [ ] UI is made of real components, not screenshots with hotspots.

## Layout review matrix

Capture at least these combinations in the available runtime; use logical dimensions, not device marketing names:

| Size | State | What to inspect |
| --- | --- | --- |
| 375×667 | 9 occupied players, river | Five board cards, action buttons and names stay clear |
| 390×844 | Static eight-player reference | Composition, font, pot, card and avatar comparisons |
| 390×844 | Heads-up | Opponent centered, correct heads-up blind roles |
| 430×932 | Six players | Balanced spacing without stretching artwork |
| 390×844 | Long names and large amounts | Ellipsis on names, full amount access, no collisions |
| 390×844 | Larger text, Reduce Motion | Readable alternatives, no hidden essential controls |

Additionally preview every integer occupancy from 2 through 9. Reflow between hands only; player identity remains stable during folds, disconnects and bets. In a nine-player game, Invite must not replace a real opponent. Show all five board slots without late-street collision. Use real safe areas when checking native devices.

## Interaction and state

- [ ] Club → Join table → table; menu/back behavior is clear.
- [ ] Host sheet works locally and describes its result honestly as a demo if no server exists.
- [ ] Player detail, chat/reaction sheet and mute controls are reachable and dismissible.
- [ ] Check appears when no amount is owed; Call displays the amount actually committed; all-in call wording is explicit.
- [ ] Raise to uses legal bounds from the playable state and requires one explicit submission.
- [ ] No double submission; pending/accepted/rejected states are visible.
- [ ] The playable seed starts at pot $5.20 with $4.60 to call; calling produces pot $9.80 and Hero stack $95.20.
- [ ] When Jules then calls in the scripted demo, pot becomes $14.40 and all three remaining stacks are $95.20.
- [ ] The static reference remains pot $14.90 and is labeled as visual-only in developer tooling.
- [ ] Locked/earned/equipped states differ; equipping The Reader persists locally and updates Hero’s crest.
- [ ] Reactions, sound and haptic preferences persist. Reduced Motion avoids spatial animation.

## Accessibility and quality

- [ ] Touch targets are at least 44 points; there are explicit state labels alongside color.
- [ ] Critical text passes contrast checks on its actual surface; folded names/amounts remain readable.
- [ ] VoiceOver reads cards, names, stacks, action availability and timer state meaningfully.
- [ ] Numeric input and chat keyboard do not cover submit controls.
- [ ] Font loading, image loading and absent network data have deliberate states.
- [ ] Relevant build/type checks pass; focused state/amount tests pass. Do not add tests that merely repeat the component markup.
- [ ] Actual runtime screenshots and launch instructions are included. Missing artwork and untested native behavior are disclosed precisely.

