# Felted 0.3 review

The visual revision adds an editorial lobby, stitched violet felt, physical card
reveals, chip movement, compact inline raising and anchored player cards. All
captures below are actual running components and legal poker state.

| Current flow | Evidence |
| --- | --- |
| New home | [375×667](polish-home-375x667.png) · [390×844](polish-home-390x844.png) · [430×932](polish-home-430x932.png) |
| Inline slider, board and hole cards visible | [Compact phone](polish-inline-raise-375x667.png) · [Standard phone](polish-inline-raise-390x844.png) |
| Short visible area during amount entry | [375×430](polish-keyboard-375x430.png) |
| Anchored player card | [375×667](polish-player-card-375x667.png) · [390×844](polish-player-card-390x844.png) |
| Actual deal and board reveals | [Preflop](polish-motion-preflop-390x844.png) · [Flop](polish-motion-flop-390x844.png) · [Turn](polish-motion-turn-390x844.png) · [River](polish-motion-river-390x844.png) |
| Payout and hand review | [Showdown](polish-motion-showdown-390x844.png) · [Review](polish-hand-review-390x844.png) |
| Collection gallery | [390×844](polish-collection-390x844.png) |
| Reader detail | [390×844](polish-reader-390x844.png) |
| Preferences | [390×844](polish-settings-390x844.png) |
| Saved session | [History and statistics](poker-session-390x844.png) |

| Real engine table | Compact 375×667 | Standard 390×844 | Tall 430×932 |
| --- | --- | --- | --- |
| Two players | [Capture](poker-2players-375x667.png) | [Capture](poker-2players-390x844.png) | [Capture](poker-2players-430x932.png) |
| Six players | [Capture](poker-6players-375x667.png) | [Capture](poker-6players-390x844.png) | [Capture](poker-6players-430x932.png) |
| Nine players | [Capture](poker-9players-375x667.png) | [Capture](poker-9players-390x844.png) | [Capture](poker-9players-430x932.png) |

[Normal-motion walkthrough](polish-interaction.mp4) records the new home, inline
raising, all four streets, payout and hand review using the real engine.
[Original interaction review, refreshed rendering](interaction-engine.mp4) shows
additional controls; [full browser review](interaction-engine.webm) records the
larger review with Reduce Motion.

## Verified

- All 27 state, layout and engine tests pass. Seeded 2–9 player sessions complete
  773 hands and 10,452 legal actions, preserving chips and all 52 distinct cards
  after every transition. Side pots, odd-cent ties and short all-ins are covered.
- All 18 gameplay browser groups pass: successive hands, dealer rotation, all-ins,
  payouts, hand history, exact reload restoration, pause/resume, named local
  hosting, setup, rules practice, collection unlocks and saved settings.
- All five visual interaction groups pass. Three phone sizes each exercise actual
  2/6/9-player tables, continuous finger movement on the slider, keyboard steps,
  cancellation without wagering and anchored cards at multiple seats. Opponent
  cards remain hidden until legally revealed. Idle profiles show no fake stack.
- Every visual occupancy 2–9 fits at 375×667, 390×844 and 430×932; dense layout fits
  375×600. Inline betting is at most 180px tall with at least 44px controls. The
  board and controls also fit a simulated 375×430 visible area during amount entry.
- Normal and reduced motion run without console or runtime errors. Normal-motion
  recording completes preflop, flop, turn, river and showdown with conservation.
- TypeScript, production Pages web export and iOS Hermes JavaScript export pass.
  Eight compressed web fonts total 233,828 bytes; native builds retain TTFs.
- The exact production build served under `/felted/` passes three phone layouts,
  inline control and player-card checks. A real hand completes, reload preserves
  cards, stacks and history, every requested resource succeeds, and developer
  controls stay hidden.
- All 18 original handoff files retain their SHA-256 checksums. Original design
  references are preserved separately from implementation and review captures.

Results: [gameplay](poker-review-results.json), [visual interactions](polish-review-results.json),
[build and engine](poker-build-results.json), [Pages production and deployment](pages-review-results.json).

The mobile review uses Chromium with touch enabled. Safari, a physical iPhone,
native VoiceOver, device text scaling, keyboards, haptics/audio and native safe
areas were not tested. A short browser viewport models available layout space;
it does not prove physical iPhone keyboard behavior.

The game remains local practice with automated opponents. Art and font sources,
licenses and derivative details are in [asset provenance](../assets/PROVENANCE.md).
Original milestone-one recordings and reference fixtures remain available for
comparison; the captures listed above describe version 0.3.
