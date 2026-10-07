# Felted

A composed, iOS-first poker app built with React Native, TypeScript and Expo SDK 57.
Play complete local no-limit Texas Hold’em games against 1–8 automated opponents,
review your hands, and collect The Reader by completing a short rules practice.
The original design handoff is preserved in [`design/felted/`](design/felted/).

## Run

Node 24 LTS is supplied by the cloud image. From `/workspace/felted`:

```bash
npm ci --no-audit --no-fund
npm run web -- --offline --max-workers 2
```

The Expo shell helper keeps caches in writable workspace locations and runs
headlessly on Linux while retaining Metro watching. No service credentials are
needed. On a Mac with Xcode, use `npm run ios`; for a compatible Expo Go or
development client, use `npm start`.

## Phone preview on GitHub Pages

Open **https://developillar.github.io/felted/** on your phone. Tap **Join table**
to play against bots; sessions are saved in that browser. GitHub confirmed the
first Pages deployment completed successfully for the tested build.

The generated site is published on `gh-pages`. The repository's
[Pages settings](https://github.com/developillar/felted/settings/pages) use
**Deploy from a branch**, **gh-pages**, **/ (root)**.

To publish a new version from a checkout with GitHub push access:

```bash
npm run build:pages -- --max-workers 2
npm run publish:pages
```

The Pages build uses `/felted` for scripts, fonts, art, audio and the favicon;
regular development and `build:web` keep `/`. `FELTED_WEB_BASE_PATH` can override
the Pages path for another project. `.nojekyll` preserves Expo's `_expo` files.
Publishing replaces only the generated `gh-pages` files, preserves branch
history, and uses a normal push so concurrent updates are rejected.

The production build was checked in a touch-enabled mobile browser: complete
gameplay, reload persistence, asset paths, and controls at 375×667, 390×844 and
430×932. See [`artifacts/pages-review-results.json`](artifacts/pages-review-results.json)
for build checks and the confirmed GitHub deployment. Direct requests to the
public site are blocked by this cloud's network policy; GitHub's successful
deployment was verified through its public workflow page.

## Settle in

- **Join table** deals a six-player practice game. Check, call, fold, bet and raise
  through preflop, flop, turn and river. The table reveals eligible opponents at
  showdown, awards the pots, and offers the next hand.
- **Practice setup** chooses 2–9 seats and $20 or $100 starting stacks. **Host a
  game** creates a named local table with automated opponents. Chips have no cash
  value; live invitations and online multiplayer are future work.
- **Raise to** means the total committed on the current street. Enter an amount,
  use the step controls or Minimum / ½ pot / Pot / All-in presets, then explicitly
  submit. The engine supplies the bounds and checks every action.
- **Review hand** explains main and side pots, shows legally revealed cards,
  lists individual awards, and includes a chronological action history.
- **Table menu → Session & hand history** shows hands played, pots won, net chips,
  and the latest 20 completed hands. Every action saves locally; return from the
  Club or reload to resume the same cards and stacks.
- **Pause game** and leaving the table stop automated actions. Returning gives
  you a fresh two-minute practice turn. An expired turn checks if legal, otherwise
  folds. Backgrounding the app also stops automated actions.
- **Learn the game** explains Hold’em and offers a side-pot question. Completing
  it unlocks The Reader; equipping its crest persists and updates your seat.
  The Host and Good Company remain locked pending shared-session features.
- **Chat and reactions** retain notes while opening and closing the sheet.
  Conversation stays on this device. Sound, haptics, mute and Reduce Motion are
  saved preferences.

Cards have short, staggered entrances, controls have restrained press feedback,
and sheets ease into place. The system and app Reduce Motion settings suppress
these movements. Animation never delays an accepted action or payout.

## Poker engine

The engine is independent of rendering. It shuffles a full 52-card deck, deals
clockwise from the button, posts actual blinds, burns before each community
street, selects the best five of seven cards, and pays exact integer cents.
Heads-up uses dealer/small-blind first preflop and big-blind first postflop.
The moving button skips busted seats between hands; visual seats stay fixed.

Full raises reopen action. Short all-in raises do not reopen players who have
already acted unless cumulative increases amount to a full raise. Short calls,
nominal bring-in against a short big blind, uncalled returns, folded contributions,
multiple side pots, board ties and odd-cent splits are handled explicitly. Odd
cents go to tied winners clockwise from the first seat left of the dealer.
The live pot includes all commitments; after settlement, the table displays the
awarded pot while commitments are cleared and stacks include their payouts.

Bots use their own two cards and public board/betting information. They never
inspect other hole cards or the undealt deck. This is a single-device practice
engine, not an authoritative network game or a real-money service. Randomness
uses a Fisher–Yates shuffle with an injectable RNG for reproducible testing.

## Checks

```bash
npm run typecheck
npm test
npm run build:web -- --max-workers 2
bash scripts/expo.sh export --platform ios --output-dir /tmp/felted-ios-export --max-workers 2
npm run test:ui  # development server must be running
```

The 27 tests cover the original seed, layout and engine rules. Seeded 2–9 player
sessions exercise 773 complete hands and 10,452 legal actions, checking chip
conservation and all 52 cards after every transition. Browser review covers
complete games, all-ins, persistence, history, collection unlocks, settings,
normal and reduced motion, and layouts at 375×667, 390×844 and 430×932.

See [`artifacts/REVIEW.md`](artifacts/REVIEW.md) for screenshots, recordings and
results. Review evidence is checked in; scratch captures, dependencies and exports
are ignored. The browser review uses the cloud image's Python Playwright,
Chromium and FFmpeg. `FELTED_REVIEW_URL` can select another development server.

Web and iOS JavaScript exports are checked. This Linux machine has no iOS
simulator; native VoiceOver, keyboards, device text scaling, audio, haptics and
real iPhone safe areas still need device review.

## Code map

| Location | Responsibility |
| --- | --- |
| `src/poker/engine.ts` | Dealing, betting, street transitions, pots and payouts |
| `src/poker/cards.ts` | Deck generation and best-five hand evaluation |
| `src/poker/bots.ts` | Decisions using a seat's own cards and public information |
| `src/poker/session.ts` | Session summaries, validation and serialized storage |
| `src/poker/sheets.tsx` | Game setup, hand reviews, history and rules practice |
| `src/motion.tsx` | Short entrances and press feedback with Reduce Motion |
| `src/money.ts` | Shared integer-cent formatting and decimal parsing |
| `src/screens.tsx` | Club, collection, Reader and table composition |
| `src/layout.ts` | Stable seat geometry, including short table areas |
| `src/game.ts` | Original read-only reference and scripted developer seed |

Developer preview preserves the static $14.90 reference and original action seed
as separate visual comparison tools. They never supply state to the poker engine.
See [`design/felted/ENGINE_NOTES.md`](design/felted/ENGINE_NOTES.md) for the expanded
scope and [`assets/PROVENANCE.md`](assets/PROVENANCE.md) for art/font provenance.
