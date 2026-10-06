"""Review the real Expo app: complete poker sessions, persistence, motion and layout."""
import json
import os
import re
import shutil
import time
import playwright
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT.parent / '.cache' / 'felted-playwright'))
registry = json.loads((Path(playwright.__file__).parent / 'driver/package/browsers.json').read_text())
revision = next(b['revision'] for b in registry['browsers'] if b['name'] == 'ffmpeg')
ffmpeg_path = Path(os.environ['PLAYWRIGHT_BROWSERS_PATH']) / f'ffmpeg-{revision}' / 'ffmpeg-linux'
if not ffmpeg_path.exists() and shutil.which('ffmpeg'):
    ffmpeg_path.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg_path.symlink_to(shutil.which('ffmpeg'))
BASE = os.environ.get('FELTED_REVIEW_URL', 'http://127.0.0.1:8081')
results, errors = [], []
KEY = 'felted.poker-session.v2'


def passed(name):
    results.append(name)
    print('PASS', name, flush=True)


def open_page(page, query='', fresh=False):
    if fresh:
        page.evaluate('(key) => localStorage.removeItem(key)', KEY)
    page.goto(BASE + '/?' + query, wait_until='networkidle')
    expect(page.get_by_text('FELTED', exact=True)).to_be_visible()
    page.evaluate('document.fonts.ready')


def state(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)


def invariant(hand):
    assert sum(p['stackCents'] + p['committedCents'] for p in hand['players']) == hand['initialChipsCents']
    cards = hand['deck'] + hand['burned'] + hand['board'] + [c for p in hand['players'] for c in p['holeCards']]
    assert len(cards) == 52 and len(set(cards)) == 52
    assert all(p['stackCents'] >= 0 for p in hand['players'])


def play_hand(page, capture=False):
    seen = set()
    until = time.monotonic() + 40
    while time.monotonic() < until:
        current = state(page)
        if not current:
            page.wait_for_timeout(80)
            continue
        hand = current['hand']
        invariant(hand)
        if hand['street'] not in seen and capture:
            page.screenshot(path=str(OUT / f'poker-{hand["street"]}-390x844.png'))
        seen.add(hand['street'])
        if hand['phase'] == 'complete':
            expect(page.get_by_role('button', name='Review hand', exact=True)).to_be_visible()
            return current, seen
        if hand['actorId'] == 'hero':
            hero = next(p for p in hand['players'] if p['id'] == 'hero')
            # A big blind checking a matched preflop bet may raise, rather than bet.
            expect(page.get_by_role('button', name='Raise' if hand['currentBetCents'] else 'Bet', exact=True)).to_be_visible()
            label = 'Check' if hero['streetCents'] >= hand['currentBetCents'] else re.compile('^Call ')
            button = page.get_by_role('button', name=label, exact=isinstance(label, str))
            if button.count() and button.is_enabled():
                button.click()
        page.wait_for_timeout(80)
    raise AssertionError('Playable hand did not complete')


def overlap(a, b):
    return a['x'] < b['x'] + b['width'] - .5 and a['x'] + a['width'] > b['x'] + .5 and a['y'] < b['y'] + b['height'] - .5 and a['y'] + a['height'] > b['y'] + .5


def layout_check(page, count, visual=True):
    board = page.get_by_test_id('board-stage').bounding_box()
    seats = page.locator('[data-testid^="seat-"]')
    occupied = seats.count() - (1 if visual and count == 8 else 0) + 1
    assert occupied == count, (occupied, count)
    boxes = [seats.nth(i).bounding_box() for i in range(seats.count())]
    for i, box in enumerate(boxes):
        assert not overlap(box, board), ('board collision', i, box, board)
        for other in boxes[i+1:]:
            assert not overlap(box, other), ('seat collision', box, other)
    assert page.get_by_test_id('board-cards').locator(':scope > div').count() == 5
    for button in page.get_by_role('button').all():
        box = button.bounding_box()
        assert box['height'] >= 43.5 and box['width'] >= 43.5, ('small target', button.get_attribute('aria-label'), box)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for button in page.locator('[role="button"]').all():
        label = button.get_attribute('aria-label') or ''
        if label in ['Fold', 'Raise', 'Bet', 'Next hand', 'New game', 'Review hand'] or label.startswith('Call '):
            box = button.bounding_box()
            assert box['y'] + box['height'] <= page.viewport_size['height'] + .5, ('action offscreen', label)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1,
        reduced_motion='reduce', record_video_dir=str(OUT / 'video'), record_video_size={'width': 390, 'height': 844})
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    open_page(page, 'seed=11&speed=fast')
    assert page.evaluate('document.fonts.check("14px IoskeleyMedium")')
    page.screenshot(path=str(OUT / 'club-390x844.png'))
    passed('Bundled Ioskeley font and refreshed Club load')

    page.get_by_role('button', name='Join table', exact=True).click()
    expect(page.get_by_role('button', name='Raise', exact=True)).to_be_enabled(timeout=7000)
    assert len(state(page)['hand']['players']) == 6
    for seat in page.locator('[data-testid^="seat-"]').all():
        assert not seat.locator('[aria-label$="of hearts"], [aria-label$="of spades"], [aria-label$="of clubs"], [aria-label$="of diamonds"]').count()
    page.screenshot(path=str(OUT / 'poker-preflop-390x844.png'))
    passed('Join deals a real six-player hand and keeps opponents cards hidden')

    page.get_by_role('button', name='Raise', exact=True).click()
    hand = state(page)['hand']
    minimum = hand['currentBetCents'] + hand['lastFullRaiseCents']
    amount = page.get_by_role('textbox', name='Raise total amount', exact=True)
    amount.fill(f'{(minimum-1)/100:.2f}')
    expect(page.get_by_text(f'Minimum total is ${minimum/100:.2f}.', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name=f'Raise to ${(minimum-1)/100:.2f}', exact=True)).to_be_disabled()
    page.get_by_role('button', name='Minimum', exact=True).click()
    expect(amount).to_have_value(f'{minimum/100:.2f}')
    page.screenshot(path=str(OUT / 'poker-raise-sheet-390x844.png'))
    page.get_by_role('button', name=f'Raise to ${minimum/100:.2f}', exact=True).click()
    first, seen = play_hand(page, capture=True)
    assert {'preflop', 'flop', 'turn', 'river', 'showdown'}.issubset(seen), seen
    assert first['hand']['result']['reason'] == 'showdown'
    assert first['handsPlayed'] == 1
    passed('Validated raise and all four streets lead to showdown and a conserved payout')

    page.get_by_role('button', name='Review hand', exact=True).click()
    expect(page.get_by_text('Hand history', exact=True)).to_be_visible()
    expect(page.get_by_text('Main pot', exact=False).first).to_be_visible()
    page.screenshot(path=str(OUT / 'poker-hand-details-390x844.png'))
    page.get_by_role('button', name='Close sheet', exact=True).click()
    previous_dealer = first['hand']['dealerIndex']
    page.get_by_role('button', name='Next hand', exact=True).click()
    second, _ = play_hand(page)
    assert second['hand']['number'] == 2 and second['hand']['dealerIndex'] != previous_dealer
    page.get_by_role('button', name='Next hand', exact=True).click()
    third, _ = play_hand(page)
    assert third['handsPlayed'] == 3 and len(third['history']) == 3
    page.get_by_role('button', name='Table menu', exact=True).click()
    page.get_by_role('button', name='Session & hand history', exact=True).click()
    expect(page.get_by_role('button', name='Review hand #1', exact=True)).to_be_visible()
    page.screenshot(path=str(OUT / 'poker-session-390x844.png'))
    page.get_by_role('button', name='Review hand #1', exact=True).click()
    expect(page.get_by_text('Hide hand #1', exact=True)).to_be_visible()
    passed('Three successive hands rotate the dealer and produce inspectable session history')

    open_page(page, 'screen=table&mode=play&count=2&seed=22&speed=fast', fresh=True)
    expect(page.get_by_role('button', name='Call $0.10', exact=True)).to_be_enabled()
    before = state(page)
    page.get_by_role('button', name='Table menu', exact=True).click()
    page.get_by_role('button', name='Pause game', exact=True).click()
    expect(page.get_by_role('button', name='Resume game', exact=True)).to_be_visible()
    page.wait_for_timeout(300)
    assert state(page)['hand']['revision'] == before['hand']['revision']
    page.get_by_role('button', name='Resume game', exact=True).click()
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('button', name='Call $0.10', exact=True)).to_be_enabled()
    restored = state(page)
    assert restored['hand']['players'] == before['hand']['players'] and restored['hand']['deck'] == before['hand']['deck']
    page.get_by_role('button', name='Table menu', exact=True).click()
    page.get_by_role('button', name='Leave table', exact=True).click()
    expect(page.get_by_role('button', name='Resume table', exact=True)).to_be_visible()
    page.get_by_role('button', name='Resume table', exact=True).click()
    expect(page.get_by_role('button', name='Call $0.10', exact=True)).to_be_enabled()
    passed('Pause, reload, leave and resume retain the exact dealt hand and stacks')

    original_seats = page.locator('[data-testid^="seat-"]').evaluate_all('(nodes) => nodes.map(n => n.dataset.testid)')
    page.get_by_role('button', name='Fold', exact=True).click()
    expect(page.get_by_role('button', name='Review hand', exact=True)).to_be_visible()
    assert state(page)['hand']['result']['reason'] == 'fold'
    assert page.locator('[data-testid^="seat-"]').evaluate_all('(nodes) => nodes.map(n => n.dataset.testid)') == original_seats
    invariant(state(page)['hand'])
    passed('Fold finishes a heads-up hand, refunds unmatched chips and retains seats')

    open_page(page, 'screen=table&mode=play&count=2&seed=2&speed=fast', fresh=True)
    page.get_by_role('button', name='Raise', exact=True).click()
    page.get_by_role('button', name='All-in', exact=True).click()
    page.get_by_role('button', name='Raise to $100.00', exact=True).click()
    all_in, _ = play_hand(page)
    invariant(all_in['hand'])
    passed('All-in preset submits the full stack and finishes with a valid payout')

    open_page(page)
    page.get_by_role('button', name='Learn the game', exact=True).click()
    unlock = page.get_by_role('button', name='Complete practice & unlock The Reader', exact=True)
    expect(unlock).to_be_disabled()
    page.get_by_role('button', name='$60', exact=True).click()
    expect(page.get_by_text('Your contribution caps your winnings.', exact=False)).to_be_visible()
    page.get_by_role('button', name='$30', exact=True).click()
    expect(unlock).to_be_enabled()
    unlock.click()
    expect(page.get_by_role('button', name='Equip crest', exact=True)).to_be_visible()
    page.screenshot(path=str(OUT / 'reader-390x844.png'))
    page.get_by_role('button', name='Equip crest', exact=True).click()
    page.reload(wait_until='networkidle')
    page.get_by_role('tab', name='Collection', exact=True).click()
    page.get_by_role('button', name='The Reader, equipped', exact=True).click()
    expect(page.get_by_role('button', name='Crest equipped', exact=True)).to_be_disabled()
    page.get_by_role('button', name='View collection', exact=True).click()
    page.screenshot(path=str(OUT / 'collection-390x844.png'))
    page.get_by_role('button', name='The Host, locked', exact=True).click()
    expect(page.get_by_role('button', name='Not yet earned', exact=True)).to_be_disabled()
    passed('Rules practice actually unlocks The Reader; equipped crest persists; future objects stay locked')

    open_page(page, 'screen=table&mode=play&count=2&seed=3&speed=fast', fresh=True)
    page.get_by_role('button', name='Chat and reactions', exact=True).click()
    page.get_by_role('textbox', name='Message', exact=True).fill('Good to see you')
    page.get_by_role('button', name='Send message', exact=True).click()
    expect(page.get_by_text('You: Good to see you', exact=True)).to_be_visible()
    page.get_by_role('button', name='Close sheet', exact=True).click()
    page.get_by_role('button', name='Chat and reactions', exact=True).click()
    expect(page.get_by_text('You: Good to see you', exact=True)).to_be_visible()
    page.get_by_role('switch', name='Mute reactions', exact=True).click()
    page.get_by_role('button', name='Quiet Nod', exact=True).click()
    expect(page.get_by_text('Quiet Nod', exact=True)).not_to_be_visible()
    page.get_by_role('button', name='Table menu', exact=True).click()
    page.get_by_role('switch', name='Sound', exact=True).click()
    page.get_by_role('switch', name='Haptics', exact=True).click()
    page.get_by_role('switch', name='Reduce motion', exact=True).click()
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Table menu', exact=True).click()
    expect(page.get_by_role('switch', name='Mute reactions', exact=True)).to_be_checked()
    expect(page.get_by_role('switch', name='Sound', exact=True)).to_be_checked()
    expect(page.get_by_role('switch', name='Haptics', exact=True)).not_to_be_checked()
    expect(page.get_by_role('switch', name='Reduce motion', exact=True)).to_be_checked()
    passed('Chat survives sheet dismissal; mute, sound, haptics and Reduce Motion persist')

    open_page(page, 'seed=4&speed=fast')
    page.get_by_role('button', name='Host a game', exact=True).click()
    page.get_by_role('textbox', name='Table name', exact=True).fill('Friday friends')
    page.get_by_role('button', name='9', exact=True).click()
    page.get_by_role('button', name='Create table', exact=True).click()
    expect(page.get_by_test_id('hand-street')).to_be_visible()
    assert state(page)['hand']['tableName'] == 'Friday friends' and len(state(page)['hand']['players']) == 9
    passed('Named hosting creates a real nine-player local practice table')

    open_page(page)
    page.get_by_role('button', name='Set up a practice game', exact=True).click()
    page.get_by_role('button', name='2', exact=True).click()
    page.get_by_role('button', name='$20.00', exact=True).click()
    page.get_by_role('button', name='Take a seat', exact=True).click()
    assert state(page)['hand']['initialChipsCents'] == 4000
    expect(page.get_by_role('button', name='Call $0.10', exact=True)).to_be_enabled()
    passed('Practice setup applies player count and stack preset')

    for width, height in [(375, 667), (390, 844), (430, 932)]:
        page.set_viewport_size({'width': width, 'height': height})
        for count in range(2, 10):
            open_page(page, f'screen=table&mode=visual&count={count}&river=1')
            layout_check(page, count)
            if count in (2, 6, 9):
                page.screenshot(path=str(OUT / f'table-{count}players-{width}x{height}.png'))
        for screen in ['club', 'reader']:
            open_page(page, 'screen=' + screen)
            page.screenshot(path=str(OUT / f'{screen}-{width}x{height}.png'))
        # Exercise real engine layouts too; none of these seats is an Invite placeholder.
        for count in (2, 6, 9):
            open_page(page, f'screen=table&mode=play&count={count}&seed=11&speed=fast', fresh=True)
            layout_check(page, count, visual=False)
            page.screenshot(path=str(OUT / f'poker-{count}players-{width}x{height}.png'))
        passed(f'{width}×{height}: all 2–9 visual occupancies and 2/6/9 real tables fit; 44-point targets')
    page.set_viewport_size({'width': 375, 'height': 600})
    open_page(page, 'screen=table&mode=visual&count=9&river=1')
    layout_check(page, 9)
    passed('Compact nine-seat layout also fits with reduced available height')

    page.set_viewport_size({'width': 390, 'height': 844})
    open_page(page, 'screen=table&mode=visual&count=8')
    page.screenshot(path=str(OUT / 'table-reference-390x844.png'))
    open_page(page, 'screen=table&mode=visual&count=9&river=1&long=1')
    layout_check(page, 9)
    page.screenshot(path=str(OUT / 'table-longnames-390x844.png'))
    page.get_by_test_id('seat-nico').click()
    expect(page.get_by_role('dialog').get_by_text('Nico Nightingale-Winter', exact=True)).to_be_visible()
    expect(page.get_by_role('dialog').get_by_text('$1234567.89 stack', exact=True)).to_be_visible()
    open_page(page, 'screen=table&mode=visual&count=9&river=1&large=1')
    page.screenshot(path=str(OUT / 'table-accessible-list-390x844.png'))
    page.get_by_role('button', name='Players and stacks', exact=True).click()
    expect(page.get_by_role('button', name='You · $98.60', exact=True)).to_be_visible()
    passed('Long money and names expose full details; simplified table exposes player list')

    # Normal-motion context exercises the animation path as well as Reduce Motion.
    motion_context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='no-preference',
        record_video_dir=str(OUT / 'video'), record_video_size={'width': 390, 'height': 844})
    motion_page = motion_context.new_page()
    motion_page.on('pageerror', lambda error: errors.append(str(error)))
    motion_page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    open_page(motion_page, 'seed=7')
    motion_page.wait_for_timeout(700)
    motion_page.get_by_role('button', name='Set up a practice game', exact=True).click()
    motion_page.get_by_role('button', name='2', exact=True).click()
    motion_page.get_by_role('button', name='Take a seat', exact=True).click()
    motion_page.get_by_role('button', name='Raise', exact=True).click()
    expect(motion_page.get_by_role('textbox', name='Raise total amount', exact=True)).to_be_visible()
    motion_page.get_by_role('button', name='Close sheet', exact=True).click()
    motion_page.get_by_role('button', name='Call $0.10', exact=True).click()
    play_hand(motion_page)
    motion_page.wait_for_timeout(700)
    motion_page.get_by_role('button', name='Review hand', exact=True).click()
    motion_page.wait_for_timeout(900)
    motion_video = motion_page.video
    motion_context.close()
    if motion_video:
        motion_video.save_as(str(OUT / 'video' / 'motion-review.webm'))
    passed('Normal-motion card entrances, press feedback and sheet transitions play without runtime errors')

    assert not errors, errors
    passed('No browser runtime or console errors')
    video = page.video
    context.close()
    if video:
        video.save_as(str(OUT / 'interaction-engine.webm'))
    browser.close()

(OUT / 'poker-review-results.json').write_text(json.dumps({'passed': results, 'errors': errors}, indent=2) + '\n')
print(f'{len(results)} browser review groups passed. Evidence: {OUT}')
