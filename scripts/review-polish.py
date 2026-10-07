"""Mobile interaction review: inline betting, anchored cards, and the redesigned flow."""
import json
import os
import re
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT.parent / '.cache' / 'felted-playwright'))
OUT = ROOT / 'artifacts'
BASE = os.environ.get('FELTED_REVIEW_URL', 'http://127.0.0.1:8081').rstrip('/')
KEY = 'felted.poker-session.v2'
results, errors = [], []


def passed(name):
    results.append(name)
    print('PASS', name, flush=True)


def watch(page):
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)


def open_home(page, fresh=True):
    page.goto(BASE + '/?seed=11&speed=fast', wait_until='networkidle')
    if fresh:
        page.evaluate('(key) => localStorage.removeItem(key)', KEY)
        page.reload(wait_until='networkidle')
    expect(page.get_by_text('FELTED', exact=True)).to_be_visible()
    page.evaluate('document.fonts.ready')


def state(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)


def invariant(hand):
    assert sum(p['stackCents'] + p['committedCents'] for p in hand['players']) == hand['initialChipsCents']
    cards = hand['deck'] + hand['burned'] + hand['board'] + [c for p in hand['players'] for c in p['holeCards']]
    assert len(cards) == 52 and len(set(cards)) == 52


def setup(page, count):
    page.get_by_role('button', name='Set up a practice game', exact=True).click()
    page.get_by_role('button', name=str(count), exact=True).click()
    page.get_by_role('button', name='Take a seat', exact=True).click()
    expect(page.get_by_role('button', name='Raise', exact=True)).to_be_enabled(timeout=15000)
    page.wait_for_function('(args) => JSON.parse(localStorage.getItem(args.key))?.hand.players.length === args.count', arg={'key': KEY, 'count': count})


def targets(page):
    width, height = page.viewport_size['width'], page.viewport_size['height']
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for button in page.get_by_role('button').all():
        box = button.bounding_box()
        if box and button.is_visible():
            assert box['width'] >= 43.5 and box['height'] >= 43.5, ('Small touch target', button.get_attribute('aria-label'), box)
    editor = page.get_by_test_id('inline-raise')
    if editor.count():
        box = editor.bounding_box()
        assert box['height'] <= 180, ('Raise panel should stay compact', box)
        assert box['y'] + box['height'] <= height
        assert box['x'] >= 0 and box['x'] + box['width'] <= width


def player_card(page, button):
    button.click()
    card = page.get_by_test_id('floating-player-card')
    expect(card).to_be_visible()
    box = card.bounding_box()
    assert box['width'] < page.viewport_size['width'] * .85
    assert box['y'] >= 0 and box['y'] + box['height'] <= page.viewport_size['height']
    expect(card.get_by_role('button', name='Close player card', exact=True)).to_be_visible()
    return card


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    for width, height in [(375, 667), (390, 844), (430, 932)]:
        context = browser.new_context(viewport={'width': width, 'height': height},
            is_mobile=True, has_touch=True, device_scale_factor=2, reduced_motion='reduce')
        page = context.new_page()
        watch(page)
        open_home(page)
        expect(page.get_by_role('button', name='Join table', exact=True)).to_be_visible()
        cta = page.get_by_role('button', name='Join table', exact=True).bounding_box()
        assert cta['y'] + cta['height'] < height - 70, ('Join above the fold', cta)
        assert page.evaluate('document.fonts.check("52px InstrumentSerif") && document.fonts.check("14px DMSansMedium")')
        page.screenshot(path=str(OUT / f'polish-home-{width}x{height}.png'))
        page.get_by_role('button', name='App settings', exact=True).click()
        expect(page.get_by_role('switch', name='Reduce motion', exact=True)).to_be_visible()
        if width == 390:
            page.screenshot(path=str(OUT / 'polish-settings-390x844.png'))
        page.get_by_role('button', name='Close sheet', exact=True).click()
        idle_profile = player_card(page, page.get_by_role('button', name='Your profile', exact=True))
        expect(idle_profile.get_by_role('button', name='Join table', exact=True)).to_be_visible()
        assert idle_profile.get_by_text('STACK', exact=True).count() == 0
        page.get_by_role('button', name='Close player card', exact=True).click()

        for count in (2, 6, 9):
            open_home(page)
            setup(page, count)
            before = state(page)
            invariant(before['hand'])
            board_before = page.get_by_test_id('board-stage').bounding_box()
            page.get_by_role('button', name='Raise', exact=True).click()
            expect(page.get_by_role('slider', name='Raise amount slider', exact=True)).to_be_visible()
            assert page.get_by_role('dialog').count() == 0
            board_after = page.get_by_test_id('board-stage').bounding_box()
            assert abs(board_before['y'] - board_after['y']) < 30, (board_before, board_after)
            targets(page)
            slider = page.get_by_role('slider', name='Raise amount slider', exact=True)
            minimum = int(slider.get_attribute('min'))
            maximum = int(slider.get_attribute('max'))
            slider.focus()
            slider.press('ArrowRight')
            expect(page.get_by_role('textbox', name='Raise total amount', exact=True)).to_have_value(f'{min(minimum + 1, maximum)/100:.2f}')
            assert state(page)['hand'] == before['hand'], 'Slider must not place a wager'
            # Exercise continuous finger movement through the browser's real range control.
            page.get_by_role('button', name='Minimum', exact=True).click()
            box = slider.bounding_box()
            cdp = context.new_cdp_session(page)
            start = {'x': box['x'] + 13, 'y': box['y'] + box['height']/2}
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [start]})
            for fraction in [.08, .16, .24, .32]:
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': box['x'] + box['width']*fraction, 'y': start['y']}]})
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
            value = int(slider.input_value())
            assert minimum < value <= maximum
            expect(page.get_by_role('textbox', name='Raise total amount', exact=True)).to_have_value(f'{value/100:.2f}')
            assert state(page)['hand'] == before['hand']
            page.get_by_role('button', name='Minimum', exact=True).click()
            if count == 6:
                page.screenshot(path=str(OUT / f'polish-inline-raise-{width}x{height}.png'))
            page.get_by_role('button', name='Cancel raise', exact=True).click()
            assert state(page)['hand'] == before['hand']
            if count == 6 and width == 375:
                # Model the smaller visible area while an on-screen keyboard is open.
                page.get_by_role('button', name='Raise', exact=True).click()
                page.set_viewport_size({'width': 375, 'height': 430})
                page.wait_for_timeout(200)
                targets(page)
                board = page.get_by_test_id('board-stage').bounding_box()
                assert board['y'] >= 0 and board['y'] + board['height'] <= 430
                page.screenshot(path=str(OUT / 'polish-keyboard-375x430.png'))
                page.get_by_role('button', name='Cancel raise', exact=True).click()
                assert state(page)['hand'] == before['hand']
                page.set_viewport_size({'width': width, 'height': height})
                page.wait_for_timeout(200)
            opponents = page.locator('[data-testid^="seat-"]')
            for index in sorted(set([0, opponents.count()//2, opponents.count()-1])):
                card = player_card(page, opponents.nth(index))
                assert card.locator('[aria-label$="of hearts"], [aria-label$="of spades"], [aria-label$="of clubs"], [aria-label$="of diamonds"]').count() == 0
                if count == 6 and index == 0:
                    page.screenshot(path=str(OUT / f'polish-player-card-{width}x{height}.png'))
                page.get_by_role('button', name='Close player card', exact=True).click()
            player_card(page, page.get_by_role('button', name=re.compile('^Your profile, stack ')))
            page.get_by_role('button', name='Close player card', exact=True).click()
        passed(f'{width}x{height}: lobby CTA, compact inline betting, touch drag, cancel, and anchored cards for 2/6/9 players')
        open_home(page)
        page.get_by_role('tab', name='Collection', exact=True).click()
        page.screenshot(path=str(OUT / f'polish-collection-{width}x{height}.png'))
        page.get_by_role('button', name='The Reader, locked', exact=True).click()
        page.screenshot(path=str(OUT / f'polish-reader-{width}x{height}.png'))
        expect(page.get_by_role('button', name='Begin the practice', exact=True)).to_be_visible()
        context.close()

    # Normal motion is recorded separately; it uses the actual legal poker engine.
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True,
        reduced_motion='no-preference', record_video_dir=str(OUT / 'video'), record_video_size={'width': 390, 'height': 844})
    page = context.new_page()
    watch(page)
    page.goto(BASE + '/?seed=7', wait_until='networkidle')
    expect(page.get_by_role('button', name='Join table', exact=True)).to_be_visible()
    page.wait_for_timeout(1200)
    setup(page, 2)
    page.wait_for_timeout(700)
    page.get_by_role('button', name='Raise', exact=True).click()
    page.wait_for_timeout(400)
    page.get_by_role('button', name='½ pot', exact=True).click()
    page.wait_for_timeout(400)
    page.get_by_role('button', name='Cancel raise', exact=True).click()
    seen = set()
    until = time.monotonic() + 60
    while time.monotonic() < until:
        current = state(page)
        if not current:
            page.wait_for_timeout(100)
            continue
        hand = current['hand']
        invariant(hand)
        if hand['street'] not in seen:
            seen.add(hand['street'])
            page.wait_for_timeout(750)
            page.screenshot(path=str(OUT / f'polish-motion-{hand["street"]}-390x844.png'))
        if hand['phase'] == 'complete':
            break
        if hand['actorId'] == 'hero':
            hero = next(player for player in hand['players'] if player['id'] == 'hero')
            label = 'Check' if hero['streetCents'] >= hand['currentBetCents'] else re.compile('^Call ')
            button = page.get_by_role('button', name=label, exact=isinstance(label, str))
            if button.count() and button.is_enabled():
                button.click()
        page.wait_for_timeout(100)
    assert state(page)['hand']['phase'] == 'complete'
    page.get_by_role('button', name='Review hand', exact=True).click()
    page.wait_for_timeout(700)
    page.screenshot(path=str(OUT / 'polish-hand-review-390x844.png'))
    video = page.video
    context.close()
    video.save_as(str(OUT / 'polish-interaction.webm'))
    passed('Normal-motion dealing, board reveals, chip movement and payouts complete a real hand with exact conservation')
    assert not errors, errors
    passed('No runtime or console errors in mobile interaction review')
    browser.close()

(OUT / 'polish-review-results.json').write_text(json.dumps({'passed': results, 'errors': errors, 'normal_motion_streets': sorted(seen), 'engine': 'Chromium mobile/touch; Safari and physical iPhone untested'}, indent=2) + '\n')
