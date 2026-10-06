# Local gameplay expansion

The user's later request explicitly expands the original UI-first handoff to a
working poker engine and a more complete app. The supplied handoff documents,
fixtures, font licenses, manifest and reference images remain unchanged. Earlier
milestone notes describe the original slice; this document describes version 0.2.

## Implemented

- Complete local no-limit Texas Hold’em for 2–9 seated players, with one human
  and automated practice opponents. It deals actual shuffled cards and progresses
  through preflop, flop, turn, river and showdown; no scripted winner.
- Integer-cent calls, full raises, short all-ins, cumulative reopening, big blind
  option, heads-up positions, folded contributions, uncalled returns, side pots,
  best-five evaluation, split pots and clockwise odd-cent awards.
- Busted seats retain their visual positions. A moving button skips unfunded
  players when the human explicitly starts the next hand.
- Engine transitions are immutable. Every transition verifies chips and card
  locations. UI action handlers and automated callbacks reject stale hand objects.
  Animation does not hold accepted actions or payouts.
- Local session restoration, serialized writes, latest 20 completed hand reviews,
  net-chip statistics, pause/resume and native AppState background pausing.
- Real side-pot knowledge practice unlocks The Reader once. The equipped crest
  migrates from existing milestone preferences, preserving earned identity.
- A dedicated collection screen, honest practice hosting, persistent settings,
  in-session chat notes, normal/reduced motion, card entrances and sheet feedback.

## Conventions

The live pot includes all committed chips. At settlement, unmatched top
commitments return to their owner before side pots are constructed. Folded chips
fund pots without granting eligibility; adjacent tiers with identical eligible
players merge. Awarded chips return to stacks and commitments become zero. The
completed table displays `result.potCents`, explicitly labeled “Awarded pot”.

Raises are total street amounts. Full increments reopen betting. Previously
acted players need to face at least a full raise before raising again; multiple
short all-ins can cumulatively meet that threshold. No player bets against only
all-in opponents. The board runs out with separate visible street transitions.

The two-minute practice deadline refreshes on each action opportunity and on
return from pause/background. Expiry checks when legal and folds otherwise.
Live-service deadlines, reconnection protocols and server authority are separate
future work. Saved games contain local deck state and are suitable for practice.

## Validation and remaining review

27 tests pass. Seeded simulations cover 773 hands and 10,452 actions at 2–9
occupancies, preserving every chip and all 52 cards. Browser checks cover actual
full hands, legal raises, all-ins, resume, dealer rotation, hand history, real
collection unlocks and both motion preferences. Web and iOS JavaScript exports
pass. The browser sizes and added short-arena tests exercise geometry, not native
safe-area behavior; iPhone installation and accessibility review remain necessary.

Live multiplayer, invitations, shared profiles, social achievements and
real-money services are not implemented. The original art master-resolution
refinements remain documented in `../../assets/PROVENANCE.md`.
