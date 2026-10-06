# Paste this into Codex in the target repository

You are implementing the first visual milestone of **Felted**, a premium iPhone social poker app. The owner owns felted.net and felted.si. This is a design-led task: visual fidelity, typography, layout, character art and tactile interaction are the main deliverables.

Read `design/felted/README.md`, `DESIGN_SPEC.md`, `ASSET_BRIEF.md`, `BUILD_PLAN.md`, `ACCEPTANCE.md`, both fixture files and `design-tokens.json`. Open and visually inspect all three images in `design/felted/references/`. If the package is elsewhere, locate it by its README rather than assuming the directory exists. Follow the repository’s existing instructions.

The intended result is a running interactive UI slice with three screens:
1. Glass Orbit live table: a quiet black, table-free horseshoe around the board, ink avatar heads, readable cream cards and a fixed personal hand dock.
2. The Night Shift club: native charcoal panels, friends at a table, Join table / Host a game and a compact collection preview.
3. The Reader achievement: a luminous hollow glass spade in a basalt setting, earned state and Equip crest.

Use **Felted** in normal copy and **FELTED** in the small tracked wordmark. Remove former product names and study labels from user-facing UI. Suggested domain roles are felted.net for the main site and felted.si for invitations; do not configure or publish either domain in this milestone.

Inspect the repository first. Preserve an established stack and working features. If it is an empty project, the proposed baseline is React Native with TypeScript, targeting iOS first; choose currently compatible tooling after checking its official documentation. Do not replace an existing native app with a website. Do not perform an unrelated framework migration. Explain material assumptions briefly and continue with reasonable reversible choices.

Implement BUILD_PLAN milestone 1 only, carrying it through to a reviewable running result:
- real reusable components and bundled Ioskeley Mono fonts;
- all three principal screens, navigable using local fixture state;
- the canonical static post-flop scene and a preview control for 2, 6 and 9 occupied players;
- the separate playable three-player seed for demonstrating Check/Call/Fold/Bet/Raise semantics without fabricating game-engine correctness;
- a raise amount sheet with clearly labeled total amount, legal bounds and one deliberate submission;
- working local Equip crest, collection detail, club-to-table navigation, reaction mute and a minimal Host a game sheet;
- reduced-motion behavior and clear empty/disabled/loading states where relevant.

The images are visual references. Reconstruct all text, cards, buttons, navigation, layout, status labels and game state with real app components. Use supplied font binaries. Produce or source the original avatar and collectible artwork described in ASSET_BRIEF. A reference screenshot is not a production asset: do not crop a whole screen into the app or substitute emoji, stock photos, generic gradients or a generic casino template. If an artwork capability is unavailable, use one clearly named temporary art fallback and report the gap; still complete the rest of the milestone. Never claim visual completion while major art is missing.

Match the approved material hierarchy: almost black interface, subtle charcoal-violet panels, pale lavender primary action, fine ink character portraits, warm cream cards, small glass crest in gameplay. Reserve sculptural environments for collectible/club moments. No rock slabs behind the board, gold trim, neon borders, glossy chibi avatars, fake rarity counts or pop-up celebrations during a decision.

Treat `fixtures/visual-postflop.json` only as a static visual comparison. Its pot, labels and action ordering are not evidence of a legal hand history. Use the separate playable seed for action demos. Values use integer cents. Keep seats stable within a hand; folded players remain visible. Hero stays at the bottom. Board geometry must support five community cards, long names and all 2–9 player counts. Use actual safe areas and a fixed bottom action region. All tappable targets are at least 44 logical points. Do not fake the operating system status bar inside the app.

Work in small coherent steps and review your own screenshots against the references after each screen is assembled. Preserve existing changes. Run the relevant build/type checks and focused checks for amount validation, action availability and layout collisions. Do not claim simulator/device testing if you could not run it. Use the accessible runtime that exists and state any remaining validation limitation precisely.

Do not expand this milestone into payments, KYC, production authentication, matchmaking, live networking, deployment, DNS changes or App Store submission. Those are later product work. Finish the UI slice and provide: launch instructions, screenshots at compact and standard iPhone sizes, a short interaction recording if supported, completed checks, remaining art gaps, and the next smallest iteration. Do not stop after a plan or generic scaffold.

