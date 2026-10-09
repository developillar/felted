"""Review the complete personal-seat, setup, learning and history flows on phones."""
import copy
import json
import os
import re
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT.parent / '.cache' / 'felted-playwright'))
BASE = os.environ.get('FELTED_REVIEW_URL', 'http://127.0.0.1:8081').rstrip('/')
OUT = ROOT / 'artifacts'
KEY = 'felted.poker-session.v2'
PROFILE = 'felted.profile.v1'
results, errors = [], []


def saved(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)


def profile(page):
    return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', PROFILE)


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


def capture(page, name, width, height):
    page.wait_for_timeout(250)
    targets(page)
    page.screenshot(path=str(OUT / f'experience-{name}-{width}x{height}.png'))


def completed_hand(page):
    deadline = time.monotonic() + 65
    while time.monotonic() < deadline:
        hand = saved(page)['hand']
        invariant(hand)
        if hand['phase'] == 'complete':
            return saved(page)
        if hand['actorId'] == 'hero':
            hero = next(p for p in hand['players'] if p['id'] == 'hero')
            label = 'Check' if hero['streetCents'] >= hand['currentBetCents'] else re.compile('^Call ')
            button = page.get_by_role('button', name=label, exact=isinstance(label, str))
            if button.count() and button.is_enabled():
                button.click()
        page.wait_for_timeout(80)
    raise AssertionError('Hand did not complete')


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    for width, height in [(375, 667), (390, 844), (430, 932)]:
        options = dict(viewport={'width': width, 'height': height}, is_mobile=True, has_touch=True,
            device_scale_factor=2, reduced_motion='no-preference' if width == 390 else 'reduce')
        if width == 390:
            options.update(record_video_dir=str(OUT / 'video'), record_video_size={'width': width, 'height': height})
        context = browser.new_context(**options)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        page.goto(BASE + '/?seed=11&speed=fast', wait_until='networkidle')
        expect(page.get_by_text('FELTED', exact=True)).to_be_visible()
        page.evaluate('document.fonts.ready')

        page.get_by_role('tab', name='You', exact=True).click()
        join = page.get_by_role('button', name='Join table', exact=True).bounding_box()
        assert join['y'] + join['height'] <= height - 70, ('Personal join should be visible above tabs', join)
        capture(page, 'first-seat', width, height)
        page.get_by_role('button', name='Edit your profile', exact=True).click()
        page.get_by_role('textbox', name='Your name', exact=True).fill(' ')
        expect(page.get_by_role('button', name='Save profile', exact=True)).to_be_disabled()
        page.get_by_role('textbox', name='Your name', exact=True).fill('Ari')
        page.get_by_role('button', name='Choose Fox portrait', exact=True).click()
        capture(page, 'profile-editor', width, height)
        page.get_by_role('button', name='Save profile', exact=True).click()
        page.wait_for_function('(key) => JSON.parse(localStorage.getItem(key))?.name === "Ari"', arg=PROFILE)
        assert profile(page) == {'name': 'Ari', 'avatar': 'fox-glasses'}
        page.reload(wait_until='networkidle')
        page.get_by_role('tab', name='You', exact=True).click()
        expect(page.get_by_text('Ari’s seat.', exact=True)).to_be_visible()
        page.get_by_role('tab', name='Home', exact=True).click()
        page.get_by_role('button', name='Set up a practice game', exact=True).click()
        page.get_by_role('button', name='2', exact=True).click()
        expect(page.get_by_label('Table preview: you and 1 automated opponent', exact=True)).to_be_visible()
        page.get_by_role('button', name='$20.00', exact=True).click()
        expect(page.get_by_text('100 big blinds', exact=True)).to_be_visible()
        capture(page, 'setup', width, height)
        page.get_by_role('button', name='Take a seat', exact=True).click()
        expect(page.get_by_role('button', name='Raise', exact=True)).to_be_enabled(timeout=15000)
        before = saved(page)
        hero = next(p for p in before['hand']['players'] if p['id'] == 'hero')
        assert hero['name'] == 'Ari' and hero['avatar'] == 'fox-glasses'
        assert hero['stackCents'] + hero['committedCents'] == 2000
        invariant(before['hand'])
        page.get_by_role('button', name=re.compile('^Your profile, stack ')).click()
        expect(page.get_by_test_id('floating-player-card').get_by_text('Ari', exact=True)).to_be_visible()
        page.get_by_role('button', name='Your seat & profile', exact=True).click()
        page.get_by_role('button', name='Edit your profile', exact=True).click()
        page.get_by_role('textbox', name='Your name', exact=True).fill('Ari Rivera')
        page.get_by_role('button', name='Choose Rabbit portrait', exact=True).click()
        page.get_by_role('button', name='Save profile', exact=True).click()
        page.wait_for_function('(key) => JSON.parse(localStorage.getItem(key))?.hand.players.find(p => p.id === "hero").name === "Ari Rivera"', arg=KEY)
        expected = copy.deepcopy(before)
        expected_hero = next(p for p in expected['hand']['players'] if p['id'] == 'hero')
        expected_hero.update(name='Ari Rivera', avatar='rabbit')
        assert saved(page) == expected, 'Editing identity must preserve every card, chip, revision, event and history entry'

        # Canceling an edit leaves both stored identity and the live game untouched.
        page.get_by_role('button', name='Edit your profile', exact=True).click()
        page.get_by_role('textbox', name='Your name', exact=True).fill('Discard me')
        page.get_by_role('button', name='Choose Frog portrait', exact=True).click()
        page.get_by_role('button', name='Close sheet', exact=True).click()
        assert profile(page) == {'name': 'Ari Rivera', 'avatar': 'rabbit'}
        assert saved(page) == expected
        capture(page, 'personal-session', width, height)
        page.get_by_role('button', name='App settings', exact=True).click()
        page.get_by_role('switch', name='Simplified table', exact=True).click()
        capture(page, 'settings', width, height)
        page.get_by_role('button', name='Close sheet', exact=True).click()
        page.get_by_role('button', name='Resume table', exact=True).click()
        expect(page.get_by_role('button', name='Players and stacks', exact=True)).to_be_visible()
        capture(page, 'simplified-table', width, height)
        page.get_by_role('button', name='Table menu', exact=True).click()
        capture(page, 'table-menu', width, height)
        page.get_by_role('button', name='Leave table', exact=True).click()
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='App settings', exact=True).click()
        expect(page.get_by_role('switch', name='Simplified table', exact=True)).to_be_checked()
        page.get_by_role('switch', name='Simplified table', exact=True).click()
        page.get_by_role('button', name='Close sheet', exact=True).click()

        page.get_by_role('tab', name='You', exact=True).click()
        page.get_by_role('button', name='A sharper eye', exact=True).click()
        capture(page, 'guide-basics', width, height)
        page.get_by_role('button', name='Next: Hand rankings', exact=True).click()
        expect(page.get_by_text('Straight flush', exact=True).first).to_be_visible()
        page.get_by_role('button', name='Explore Full house', exact=True).click()
        expect(page.get_by_text('Full house', exact=True).first).to_be_visible()
        capture(page, 'guide-rankings', width, height)
        page.get_by_role('button', name='Side pots', exact=True).click()
        expect(page.get_by_role('button', name='Complete practice & unlock The Reader', exact=True)).to_be_disabled()
        page.get_by_role('button', name='$60', exact=True).click()
        expect(page.get_by_text('Your contribution caps your winnings.', exact=False)).to_be_visible()
        page.get_by_role('button', name='$30', exact=True).click()
        capture(page, 'guide-side-pots', width, height)
        page.get_by_role('button', name='Complete practice & unlock The Reader', exact=True).click()
        page.get_by_role('button', name='Equip crest', exact=True).click()
        page.get_by_role('tab', name='You', exact=True).click()
        page.get_by_role('button', name='Resume table', exact=True).click()
        finished = completed_hand(page)
        assert finished['handsPlayed'] == 1 and len(finished['history']) == 1
        assert next(p for p in finished['hand']['players'] if p['id'] == 'hero')['name'] == 'Ari Rivera'
        page.get_by_role('button', name='Review hand', exact=True).click()
        capture(page, 'hand-review', width, height)
        expect(page.get_by_text('Where the chips went.', exact=True)).to_be_visible()
        expect(page.get_by_text('Hand history', exact=True)).to_be_visible()
        page.get_by_role('button', name='Close sheet', exact=True).click()
        page.get_by_role('button', name='Table menu', exact=True).click()
        page.get_by_role('button', name='Your seat & profile', exact=True).click()
        page.get_by_role('button', name='Open history for hand #1', exact=True).click()
        expect(page.get_by_role('button', name='Hide hand #1', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='All saved hands', exact=True)).to_be_visible()
        capture(page, 'history', width, height)
        page.get_by_role('button', name='All saved hands', exact=True).click()
        expect(page.get_by_role('button', name='Review hand #1', exact=True)).to_be_visible()
        page.get_by_role('button', name='Close sheet', exact=True).click()
        page.reload(wait_until='networkidle')
        page.get_by_role('tab', name='You', exact=True).click()
        expect(page.get_by_role('button', name='Open history for hand #1', exact=True)).to_be_visible()
        assert saved(page)['hand'] == finished['hand']
        assert saved(page)['history'] == finished['history']
        assert profile(page) == {'name': 'Ari Rivera', 'avatar': 'rabbit'}
        capture(page, 'personal-complete', width, height)
        video = page.video if width == 390 else None
        context.close()
        if video:
            video.save_as(str(OUT / 'experience-interaction.webm'))
        result = f'{width}x{height}: identity persistence and cancellation, exact game preservation, setup, accessibility, guide, unlock, real payout and direct history review'
        results.append(result)
        print('PASS', result, flush=True)
    assert not errors, errors
    results.append('No console or runtime errors; normal and reduced motion both reviewed')
    print('PASS', results[-1], flush=True)
    browser.close()

(OUT / 'experience-review-results.json').write_text(json.dumps({'version': '0.4.0', 'passed': results, 'errors': errors,
    'browser': 'Chromium mobile/touch; physical iPhone and Safari untested'}, indent=2) + '\n')
