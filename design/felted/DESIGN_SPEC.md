# Felted design specification

Version 1.0. Numerical values below are proposed implementation starting points, not measurements extracted from the generated images.

## 1. Identity and direction

Display name: **Felted**. Small header wordmark: **FELTED**, Ioskeley Mono Medium, widely tracked. Package/repository slug: `felted`. Do not invent a legal company name, bundle identifier or developer account identifier.

The experience should feel intimate, composed and tactile. Friends and their personal objects give it character. Poker state stays immediately readable. The prior generic casino treatment was rejected; keep this selected direction rather than reinventing it during implementation.

Reference priority: this specification for behavior and state; Felted table image for gameplay composition; club image for social UI; achievement image for collectible rendering. Generated imagery sometimes approximates text and spacing; the written spec wins when the image is contradictory or incomplete.

Opal is inspiration for restrained native black panels and sculptural collectibles. Felted owns its own wordmark, characters, spade sculpture and copy. Do not ship Opal screenshots, logos or gem models.

## 2. Visual system

| Role | Starting value | Use |
| --- | --- | --- |
| Canvas | #050507 | Screen background |
| Surface | #14141D | Native panels and hero dock |
| Raised surface | #1D1D28 | Sheets, selected navigation item |
| Hairline | #353343 | Quiet decorative boundaries |
| Strong boundary | #817C99 | Controls requiring a clearer outline |
| Primary text | #F4F3F7 | Main copy, pot, player names |
| Secondary text | #B9B7C8 | Stacks, helper text |
| Muted text | #9693A8 | Minor metadata, never critical money |
| Accent | #C5B8FF | Call action, selection, turn arc |
| Text on accent | #111016 | Primary button label |
| Card face | #F5F0E6 | All visible playing cards |
| Hearts / spades | #BE273B / #20212A | Suit plus symbol identifies each |
| Diamonds / clubs | #245EA8 / #176B50 | Four-color deck option |
| Positive / warning | #8CDEBD / #F2BA73 | Check/connected, raise/activity |
| Error | #FF969C | Errors, with explicit text |

Use continuous corners where available. Start with 24-point panel radii, 20-point sheets/components and full pill rounding for actions. Spacing scale: 4, 8, 12, 16, 24, 32, 40. Standard horizontal screen padding 16; compact table outer padding 12. A 1-point border is a boundary, not an ornament. No broad color gradients on the canvas. Surface shading is subtle and localized; glass color belongs in artwork.

## 3. Typography

Bundle the included Ioskeley Mono fonts. The images contain an approximation; the real fonts are authoritative. Prefer explicit face mappings over synthetic weights:

| File | iOS PostScript name |
| --- | --- |
| IoskeleyMono-Regular.ttf | Ioskeley-Mono |
| IoskeleyMono-Medium.ttf | Ioskeley-Mono-Medium |
| IoskeleyMono-SemiBold.ttf | Ioskeley-Mono-Semibold |

Use Ioskeley Mono for pot, stacks, bet amounts, short metadata, controls and wordmark. Use the native system sans for longer explanations and large headings. Do not bundle extracted Apple font files. Disable programming ligatures in financial/numeric UI. Keep lining, stable-width numerals; amounts must not jump horizontally when updated.

Starting sizes in logical points: wordmark 14/20 with 4-point tracking; screen title 30/36 semibold system; pot 28/34 mono medium; primary action 17/22 mono medium; player name and stack 12/16 mono; body 16/22 system; small metadata 12/16 mono. Do not scale all text by the screenshot’s pixel ratio. Respect text scaling. For accessibility sizes, simplify the table and expose an accessible player list rather than silently clipping names or shrinking crucial amounts.

## 4. Live table: Glass Orbit

Three stable regions: header; table arena; bottom player/actions region. Respect real top and bottom safe areas. Start with a 52-point header, a 96–112-point personal dock, 12-point gap, and a 60-point action row. The arena uses the remaining height. Compact-height devices may use a 52-point action row and smaller artwork, while retaining at least 44-point touch targets.

Header: menu at left, FELTED centered, chat at right with a small unread dot. Game menu opens table details, sound/reaction settings and leave controls. Chat opens a sheet; it never replaces the primary action region unexpectedly.

Arena: no oval rail or visible dotted track. Compact avatars sit around a quiet central rounded panel containing pot, board and stakes. Name and stack float below each portrait. Use an avatar of roughly 44–56 points; reserve a seat box of roughly 68–80 points in width. Keep name, stack, action label and blind marker clear of neighboring cards. Folded players retain their name/stack and a Folded label; dim the artwork modestly instead of fading essential information away.

Hero: permanently at bottom, portrait and small equipped crest at left, name/stack nearby, hole cards at right, optional made-hand label beneath cards. Crest is 16–20 points at this size. One slim active timer arc indicates the acting player. The latest reference omits the hero arc; the implementation must include it when Hero is active. Timer is derived from a deadline, not an arbitrary decorative loop. Duration remains a configurable product decision.

### Seats and density

Seat identity and poker position are separate from visual position. Hero is seat zero in the local view; order follows real clockwise seating. Never compact, reorder or remove seats while a hand is in progress. At hand boundaries, available seats can reflow smoothly. In heads-up play, dealer is also small blind; do not apply multiway blind rules blindly.

The nine-seat layout includes Hero plus eight perimeter positions. The eight-player reference has seven opponents plus one Invite position. A full nine-player layout replaces Invite with a player; it does not drop a seated player.

Proposed perimeter anchors, normalized to arena width/height, proceeding clockwise after Hero: lower-left (0.10, 0.84), middle-left (0.10, 0.54), upper-left (0.10, 0.27), top-left (0.39, 0.10), top-right (0.65, 0.10), upper-right (0.90, 0.27), middle-right (0.90, 0.54), lower-right (0.90, 0.84). These are layout guides; solve label bounds and collision constraints at each device size rather than treating them as immutable pixel coordinates.

| Occupancy | Layout rule |
| --- | --- |
| 2 players | Opponent centered above board; Hero bottom; invite affordance in header/menu |
| 3–4 players | Symmetric upper arc; keep board and Hero anchored |
| 5–6 players | Two side rows plus top arc; fixed clockwise order |
| 7–9 players | Dense perimeter anchors, compact portraits and optional detail on tap |

Missing/empty seats are represented without implying another live player. The developer preview must exercise every count from 2 through 9; screenshot review must cover at least 2, 6 and 9.

### Board and amounts

Reserve five consistent community-card slots from the beginning of the hand. The reference’s three large flop cards are illustrative; later streets must fit without overlapping players. Prefer roughly 34–40-point-wide board cards in the densest layout, 4-point gaps, clearly readable rank and suit. At lower density, the same row can grow. Do not recenter existing cards or resize the entire interface on turn/river. Empty future slots can be visually quiet with no heavy dashed boxes.

Cream card faces, dark crisp rank, conventional suit shape and a modest shadow. Hero hole cards are larger, roughly 48–58 points wide, slightly fanned but still readable. Opponent cards remain backs unless revealed by valid game state. Do not infer or show opponents’ hand strength.

Money is stored as integer cents and formatted centrally. Pot includes committed bets according to a single documented engine convention; chip art never determines the value. Make side pots individually inspectable in the expanded hand/pot detail. Do not label every pot “Total pot” while excluding current bets.

### Actions

| Situation | Primary choices |
| --- | --- |
| Facing a bet | Fold / Call [amount] / Raise |
| Nothing to call | Check / Bet (with a separate Fold option in the layout if needed) |
| Call exceeds stack | Fold / Call all-in [stack]; raise available only if legal |
| Not Hero’s turn | Informational “Waiting for [name]”; action controls disabled |
| Disconnected | Reconnecting state, no duplicate accepted action |

Raise sheet: label amount as **Raise to** and show how much more will be committed. Bet sheet: **Bet amount**. Supply legal minimum/maximum from state; show disabled reasons when necessary. Use a numeric input plus accessible increment/decrement controls; optional slider may supplement them. Selected amount is not submitted until the explicit button is tapped. Keep the primary Call button from shifting under the finger. Debounce submission and present pending/accepted/rejected feedback.

The separate playable seed uses a first flop bet of $4.60. In that seed, minimum full raise is to $9.20. This is a property of that seed, not a universal formula for every hand; short all-in raises and reopening action need actual poker-rule handling later.

## 5. Social club: The Night Shift

Top: small FELTED wordmark and profile. Title and subheading: The Night Shift; “Your people. Your table.” The club crest vignette takes approximately the upper third of the screen and blends into black. Titles must not run over bright portions of the sculpture; the generated reference is a composition cue, not permission for text/art collision.

Tonight’s table panel: game and stakes, no-rake label, friend portraits, count, Join table. A brief club message is a social preview, not a blocking dialog. Empty table state says “Start tonight’s table” and offers Host a game. Full table state offers View table or Wait for a seat; it must not promise an open seat.

Host a game: compact sheet with table name, capacity 2–9, fixture stake preset, Create table. For the first UI milestone, it creates a local demo table and a clearly identified demo invitation preview. A fake shared link must not pretend to connect to a real table. Real invite generation is a later service concern.

Club collection: small earned object preview row; tapping opens collection/detail. Bottom native floating pill navigation uses one consistent family of icons: spade for Play, people for Club, display case/grid for Collection. The images vary slightly; choose one consistent interpretation. Hide this global tab bar during a hand.

Social MVP: player profile sheet, short text chat, four curated reactions, mute reaction animation, simple friend/club presence. Delay voice rooms, feeds, trading and complex moderation tooling until the core experience works. Surface reactions briefly near the sender without covering cards, stacks or controls. Cosmetic animations never reveal hidden information or change game timing.

## 6. Achievements and collection

The Reader is a crafted hollow glass spade with cool lavender/aqua refraction, resting on dark basalt. Full environmental richness belongs in this view. Render the scene as art, with real accessible UI layered separately. Main copy: “The Reader”; “A sharper eye. A calmer game.” Category: Knowledge · Earned. Completion: “Completed the rules and side-pot practice.” Reward: “Unlocks the Quiet Nod reaction.” Primary action: Equip crest. Secondary: View collection.

Locked, in-progress, newly earned, earned and equipped are distinct states. A completion event unlocks the object once; equipping persists and appears as the small Hero crest and profile identity. Newly earned presentation waits until the current hand has ended. Allow dismissal and replay from Collection. Collection should make earned objects easy to inspect, with concise requirements for locked objects.

Proposed initial set: The Reader (complete the primer and side-pot practice), The Host (host a first completed social session), Good Company (receive optional post-session appreciation). These are proposed criteria to refine, not implemented achievements. Use truthful progress toward an explicit requirement. No fabricated ownership percentage, wager-volume ladder, daily-play pressure or paid randomness in this initial identity system.

## 7. Motion, sound and touch

All timings are starting targets for device review. Press feedback: 80 ms in / 120 ms out. Sheet transition: 240–300 ms. Card movement: 180–220 ms, with about 60–80 ms deal stagger. Chip movement: 220–300 ms to a stable pot anchor. Avoid springy amount labels. Turn change: one restrained highlight transition and optional light haptic. Achievement entrance: 700–1000 ms, interruptible; subtle material motion may follow only while the view is open.

Use one soft card sound, one quiet chip sound and a restrained success cue. Settings persist for sound, haptics and reaction motion. No overlapping celebratory audio or repeated haptics while a countdown runs. Reduced Motion removes orbit, parallax and traveling chips; use short opacity changes and immediate numeric updates. Never delay an accepted action for an animation.

## 8. Accessibility and responsive behavior

At least 44×44-point interaction targets. Meaning never depends only on color or a timer ring. VoiceOver should expose “Ava, stack 42 dollars 90 cents, active” and “Queen of hearts”; decorative chips and stone are hidden from accessibility. Inactive/folded/disconnected states have text. Numeric input, sheets and dismissal have logical focus order. Ensure sufficient contrast in actual rendered text; decorative borders do not establish contrast for critical controls.

At large text sizes, allow club/collection screens to scroll. In the table, preserve board and actions and provide a readable player list/detail presentation. No horizontal scrolling for the action row. Keyboard must not obscure submission in chat or amount entry. Do not add safe-area padding twice. Test both short screens and contemporary tall screens.

