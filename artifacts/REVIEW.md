# Felted 0.2 review

The app now runs complete local no-limit Texas Hold’em sessions against automated
opponents. These captures are actual Expo browser rendering, with original art
and the supplied Ioskeley Mono font.

| Current flow | Evidence |
| --- | --- |
| Club | [390×844](club-390x844.png) |
| Actual dealt hand | [Preflop](poker-preflop-390x844.png) |
| Betting streets | [Flop](poker-flop-390x844.png) · [Turn](poker-turn-390x844.png) · [River](poker-river-390x844.png) |
| Legal raise controls | [Raise sheet](poker-raise-sheet-390x844.png) |
| Awarded pot and revealed cards | [Showdown](poker-showdown-390x844.png) |
| Pots, cards and actions | [Hand review](poker-hand-details-390x844.png) |
| Three-hand session | [History and statistics](poker-session-390x844.png) |
| Personal objects | [Collection](collection-390x844.png) |
| Completed knowledge practice | [The Reader](reader-390x844.png) |

| Real engine table | Compact 375×667 | Standard 390×844 | Tall 430×932 |
| --- | --- | --- | --- |
| Two players | [Capture](poker-2players-375x667.png) | [Capture](poker-2players-390x844.png) | [Capture](poker-2players-430x932.png) |
| Six players | [Capture](poker-6players-375x667.png) | [Capture](poker-6players-390x844.png) | [Capture](poker-6players-430x932.png) |
| Nine players | [Capture](poker-9players-375x667.png) | [Capture](poker-9players-390x844.png) | [Capture](poker-9players-430x932.png) |

[Normal-motion interaction recording](interaction-engine.mp4) shows the actual
practice flow and transitions. [Full automated review](interaction-engine.webm)
records the larger browser review with Reduce Motion.
[Machine-readable results](poker-review-results.json) list all 18 passing groups.
[Build and engine verification](poker-build-results.json) records the other checks.

## Verified

- All 27 state/layout/engine tests pass. Rule cases include best five of seven,
  ace-low straights, full-house and kicker selection, heads-up action order, the
  big blind option, short all-in reopening, cumulative short raises, side pots,
  folded eligibility, uncalled returns and odd-cent board ties.
- Seeded 2–9 player sessions complete 773 hands and 10,452 legal actions. Every
  transition preserves chips and all 52 distinct cards; every payout balances.
- All 18 browser review groups pass. Actual UI plays three successive hands,
  completes showdown, rotates the button and reviews stored history. Other flows
  verify all-in, fold, exact-card restoration, pause/resume, named practice hosting,
  stack presets, the rules exercise, equipped crest persistence and settings.
- Every visual occupancy 2–9 and actual 2/6/9-player tables fit at 375×667, 390×844
  and 430×932. Dense layout also fits a 375×600 browser area. Tested table controls
  are at least 44 logical points; no seat/board collisions or offscreen actions.
- Long names and money expose full values in player detail; simplified layout
  exposes an accessible player list. Normal and reduced motion both run.
- No browser runtime or console errors. TypeScript, production web export and
  iOS Hermes JavaScript export pass.
- The exported production app completes a heads-up game with exact chip
  conservation, loads its favicon, and hides developer preview controls.

This Linux machine has no iOS simulator. Native installation, VoiceOver, device
text scaling, keyboards, haptics/audio and iPhone safe areas remain untested.
Browser sizes and JavaScript export cannot demonstrate those native behaviors.

The game is local practice; live invitations and online multiplayer are future
work. Higher-resolution art masters and one additional unique avatar remain
listed in [`assets/PROVENANCE.md`](../assets/PROVENANCE.md).

The static-reference `table-*` captures, original `interaction.mp4`, original
`interaction-review.webm` and `review-results.json` remain as milestone-one
comparison evidence. Current engine evidence uses the `poker-*` filenames above.
