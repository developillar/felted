"""Smoke-test the exact production export at GitHub Pages' project path."""
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT.parent / '.cache' / 'felted-playwright'))
BASE = os.environ.get('FELTED_REVIEW_URL', 'http://127.0.0.1:9062/felted').rstrip('/')
KEY = 'felted.poker-session.v2'
results, errors, resources, streets = [], [], [], set()


def saved(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)


def invariant(hand):
    assert sum(p['stackCents'] + p['committedCents'] for p in hand['players']) == hand['initialChipsCents']
    cards = hand['deck'] + hand['burned'] + hand['board'] + [c for p in hand['players'] for c in p['holeCards']]
    assert len(cards) == 52 and len(set(cards)) == 52


def targets(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for button in page.locator('[role="button"], [role="tab"], [role="switch"]').all():
        if button.is_visible():
            box = button.bounding_box()
            assert box['width'] >= 43.5 and box['height'] >= 43.5, (button.get_attribute('aria-label'), box)


def passed(message):
    results.append(message)
    print('PASS', message, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    for width, height in [(375, 667), (390, 844), (430, 932)]:
        context = browser.new_context(viewport={'width': width, 'height': height},
            is_mobile=True, has_touch=True, device_scale_factor=2, reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        page.on('response', lambda response: resources.append({'url': response.url, 'status': response.status}))
        # Developer query switches must not alter the production entry screen.
        page.goto(BASE + '/?v=0.4.0&screen=table&mode=visual&seed=11&speed=fast', wait_until='networkidle')
        expect(page.get_by_role('button', name='Set up a practice game', exact=True)).to_be_visible()
        page.evaluate('document.fonts.ready')
        assert 'viewport-fit=cover' in page.locator('meta[name="viewport"]').get_attribute('content')
        targets(page)
        page.get_by_role('tab', name='You', exact=True).click()
        page.get_by_role('button', name='Edit your profile', exact=True).click()
        page.get_by_role('textbox', name='Your name', exact=True).fill('June')
        page.get_by_role('button', name='Choose Rabbit portrait', exact=True).click()
        page.get_by_role('button', name='Save profile', exact=True).click()
        page.get_by_role('tab', name='Home', exact=True).click()
        page.get_by_role('button', name='Set up a practice game', exact=True).click()
        page.get_by_role('button', name='2', exact=True).click()
        expect(page.get_by_label('Table preview: you and 1 automated opponent', exact=True)).to_be_visible()
        page.get_by_role('button', name='Take a seat', exact=True).click()
        expect(page.get_by_role('button', name='Raise', exact=True)).to_be_enabled(timeout=15000)
        before = saved(page)
        invariant(before['hand'])
        hero = next(p for p in before['hand']['players'] if p['id'] == 'hero')
        assert hero['name'] == 'June' and hero['avatar'] == 'rabbit'
        page.get_by_role('button', name='Raise', exact=True).click()
        editor = page.get_by_test_id('inline-raise')
        expect(editor).to_be_visible()
        targets(page)
        box = editor.bounding_box()
        assert box['height'] <= 180 and box['y'] + box['height'] <= height
        page.get_by_role('button', name='Cancel raise', exact=True).click()
        assert saved(page) == before
        page.get_by_role('button', name=re.compile('^Your profile, stack ')).click()
        card = page.get_by_test_id('floating-player-card')
        expect(card).to_be_visible()
        box = card.bounding_box()
        assert 0 <= box['y'] and box['y'] + box['height'] <= height
        page.get_by_role('button', name='Close player card', exact=True).click()
        passed(f'{width}x{height}: production home, saved profile, live setup preview, compact raising, safe cancellation, anchored card and 44px controls')

        if width == 390:
            deadline = time.monotonic() + 90
            while time.monotonic() < deadline:
                hand = saved(page)['hand']
                invariant(hand)
                streets.add('showdown' if hand['phase'] == 'complete' else hand['street'])
                if hand['phase'] == 'complete':
                    break
                if hand['actorId'] == 'hero':
                    hero = next(p for p in hand['players'] if p['id'] == 'hero')
                    label = 'Check' if hero['streetCents'] >= hand['currentBetCents'] else re.compile('^Call ')
                    button = page.get_by_role('button', name=label, exact=isinstance(label, str))
                    if button.count() and button.is_enabled():
                        button.click()
                page.wait_for_timeout(100)
            finished = saved(page)
            assert finished['hand']['phase'] == 'complete' and finished['handsPlayed'] == 1
            page.get_by_role('button', name='Review hand', exact=True).click()
            expect(page.get_by_text('Where the chips went.', exact=True)).to_be_visible()
            page.get_by_role('button', name='Close sheet', exact=True).click()
            page.get_by_role('button', name='Table menu', exact=True).click()
            assert page.get_by_role('button', name='Developer preview', exact=True).count() == 0
            page.get_by_role('button', name='Your seat & profile', exact=True).click()
            page.get_by_role('button', name='Open history for hand #1', exact=True).click()
            expect(page.get_by_role('button', name='Hide hand #1', exact=True)).to_be_visible()
            page.get_by_role('button', name='Close sheet', exact=True).click()
            page.reload(wait_until='networkidle')
            assert saved(page)['hand'] == finished['hand'] and saved(page)['history'] == finished['history']
            page.get_by_role('tab', name='You', exact=True).click()
            expect(page.get_by_text('June’s seat.', exact=True)).to_be_visible()
            passed('Real production hand completes with chip/card conservation; profile, exact hand and history survive reload; recent hand opens the selected review')
        context.close()

    assert not errors, errors
    assert all(r['status'] in (200, 206, 304) for r in resources), resources
    assert all(r['url'].startswith(BASE + '/') for r in resources), resources
    fonts = {r['url'] for r in resources if '.woff2' in r['url']}
    assert len(fonts) == 8 and not any('.ttf' in r['url'] for r in resources)
    passed('All requested production resources succeed under /felted/; eight WOFF2 fonts; developer switches ignored; no console or runtime errors')
    browser.close()

(ROOT / 'artifacts' / 'pages-review-results.json').write_text(json.dumps({
    'version': '0.4.0', 'target': 'GitHub Pages production build served locally at /felted/',
    'passed': results, 'streets_seen': sorted(streets), 'runtime_errors': errors,
    'resource_statuses': resources, 'web_font_bytes': sum(f.stat().st_size for f in (ROOT / 'assets/fonts/web').glob('*.woff2')),
    'browser': 'Chromium mobile/touch; physical iPhone and Safari untested',
    'verified_at': datetime.now(timezone.utc).isoformat(),
    'deployment': {'status': 'pending'}
}, indent=2) + '\n')
