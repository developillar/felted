# Build sequence

This is a staged product implementation plan, not an instruction to implement the entire production service in one pass. The first Codex prompt authorizes milestone 1. Later prompts are ready to use after visual review.

## Milestone 1 — Interactive visual slice

1. Inspect the target repo, its instructions, available simulator/runtime, installed dependencies and existing screen structure. Record the baseline and preserve unrelated work. Retain the stack. For an empty project, the proposed default is React Native + TypeScript; verify compatible tooling from its current official docs before selecting versions.
2. Load the actual fonts. Translate `design-tokens.json` into the existing theme system. Implement reusable primitives: Screen, Wordmark, Surface, IconButton, PillButton, Amount, PlayingCard, AvatarSeat, ActionStatus, TimerArc, HeroDock, BoardStage, PotSummary, ActionBar, RaiseSheet, ReactionBubble, ClubTableCard, CollectibleStage and FloatingTabBar.
3. Build the live table against the static visual fixture. Preview all player counts, long names and five board cards. Keep state/data outside rendering and lay out players by stable seat ID.
4. Build club and achievement screens with local navigation and equip state. Shared controls must look like the same product across all screens.
5. Add the separate playable three-player seed. It needs a small deliberate state transition demo, not a claim of a complete poker engine. Implement amount bounds, pending actions, a response script and a reset control in a developer-only preview menu. Do not mutate the static visual comparison fixture into a guessed legal hand history.
6. Add local host flow, collection/detail, reaction mute, settings and user-feedback states. Keep all demo-only controls outside the intended production interface.
7. Add motion, sound and haptics only after geometry and type match. Capture actual runtime screenshots at compact/standard widths. Compare against all three references and correct obvious drift before delivery.

Deliver the running slice, instructions, screenshots and a short gap list. If no iOS simulator/device is available, use the accessible preview runtime and be explicit about which iOS behaviors remain untested. Do not invent test results.

## Milestone 2 — Visual refinement and original assets

Paste after reviewing milestone 1:

> Continue Felted from the existing visual slice. Read design/felted/ACCEPTANCE.md and compare the latest runtime screenshots to the three reference images. Fix the largest visual mismatches first: real Ioskeley Mono, avatar consistency, native panel restraint, five-card density, Hero dock, button geometry and collectible lighting. Complete the original production assets in ASSET_BRIEF. Preserve the agreed screen hierarchy and working behavior. Return before/after screenshots and the remaining concrete gaps. Do not introduce new product sections or replace the art direction.

## Milestone 3 — Local rules-complete poker

Paste once the UI direction is stable:

> Keep Felted’s visual system intact and implement a deterministic local Texas Hold’em rules layer behind the existing interfaces. Cover 2–9 players, blinds including heads-up, betting rounds, legal raises, all-ins, reopening action, side pots, folded players, showdown ties, pot splitting, integer-cent accounting and hand reset. Separate private hole-card data from public table state. Use focused rule tests and conservation-of-chips checks. Do not reuse the static screenshot fixture as a rules test. Return a playable local hand flow and evidence for the edge cases exercised. Do not add production networking or payment services in this milestone.

## Milestone 4 — Private social multiplayer

Paste after the local rules layer is verified:

> Connect the existing Felted client to an authoritative private-table service. Retain the verified rules layer and screen components. Define a public snapshot, player-private snapshot, ordered events and idempotent action requests. Implement create/join/invite, reconnect/resync, stable seats, authoritative turn deadlines and duplicate-action handling. Never trust a client to select winners, balances or legal actions. Add friends/club presence, bounded chat/reactions and persistent cosmetic achievement state. Keep the environment explicitly for development/play testing. Provide a two-client demo and concrete reconnect/disconnect results. Work within the chosen backend rather than inventing a second stack.

## Later product work

Actual accounts, payments, money custody, launch requirements, App Store distribution and operational controls need their own explicit scope. “No rake” is the intended product model; it is not a legal conclusion or a complete operating plan. The handoff contains no chosen payment provider and makes no instant-transfer guarantee.

## Repository handoff convention

Keep this source package under `design/felted/`. Place production art and fonts in the app’s existing asset location and reference them through one manifest. Keep design docs separate from generated build output. Use a small changelog for subsequent visual decisions so the next Codex turn does not reopen settled choices. Use the existing repository’s contribution workflow; never overwrite root instructions with this package.

