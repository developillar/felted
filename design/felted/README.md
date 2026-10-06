# Felted — Codex design handoff

Version 1.0 · October 6, 2026 · Prepared for Kenneth Gelasio

**Felted** is the new product name. The owner reports owning **felted.net** and **felted.si**. This package turns the selected visual direction into an implementation brief. It contains documentation, design data, reference images, and fonts; it does not contain an app implementation.

## Start here

1. Unzip this folder into the target repository as `design/felted/` (the contents of this folder go directly inside that path).
2. Open that repository in Codex.
3. Paste the complete prompt from `CODEX_START_HERE.md`.
4. Have Codex complete the first visual milestone and return screenshots of the running app. Iterate on those before extending the product.

## The selected direction

| Screen | Reference | Role |
| --- | --- | --- |
| Live table | `references/felted-table.png` | Primary: Glass Orbit, table-free horseshoe, personal hand dock |
| Club home | `references/felted-club.png` | Social presence, charcoal panels, club collectible |
| Achievement | `references/felted-achievement.png` | The Reader: glass sculpture, restrained celebration |

These are visual targets, not production UI assets or exact layout specifications. The document rules resolve generated-image omissions, inconsistent icons, oversized sample cards, and poker-state inconsistencies. Build real components; do not display a full screenshot behind invisible buttons.

## Package map

- `CODEX_START_HERE.md`: paste-ready first implementation prompt.
- `DESIGN_SPEC.md`: branding, visual system, screen behavior, layout and motion.
- `BUILD_PLAN.md`: staged implementation and follow-up prompts.
- `ACCEPTANCE.md`: concrete visual and interaction checks.
- `ASSET_BRIEF.md`: production artwork requirements, asset prompts, provenance.
- `design-tokens.json`: proposed starting tokens; refine through actual device review.
- `fixtures/visual-postflop.json`: exact static reference scene; explicitly not a legal engine fixture.
- `fixtures/playable-flop-seed.json`: separate, internally consistent three-player hand seed.
- `references/`: three renamed Felted concept screenshots.
- `assets/fonts/`: Ioskeley Mono Regular, Medium, and SemiBold, license, source information.
- `MANIFEST.json`: file inventory, byte counts and SHA-256 checksums.

## Scope and decisions

Confirmed direction: premium iPhone social Texas Hold’em, no rake, 2–9 players, meaningful social identity and earned achievements. The priority is visual quality and game feel. The first implementation is an interactive, fixture-driven UI slice. Payments, live-money operation and multiplayer services are separate workstreams.

The latest positive feedback approved the Opal-inspired family. This package recommends Glass Orbit as the primary table and retains the selected club and achievement language. No further choice between four competing table layouts is needed to begin.

Suggested domain roles: `felted.net` for the main product website; `felted.si` for short invitations. These are proposals, not configured services. No DNS, hosting, email, app links, App Store identity or trademark clearance was performed here.

Product rules still open: maximum stakes (the original message ended at “up to 2/”), buy-in ranges, timer duration, table ownership rules, and launch geography. The $0.10/$0.20 screenshot is a fixture, not the maximum stakes decision.

