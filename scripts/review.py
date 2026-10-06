"""Functional browser review of the actual Expo runtime, plus screenshot evidence.

Run from the repository while `npm run web -- --offline --max-workers 2` runs.
Requires Python Playwright and Chromium (provided by the cloud image).
"""
import json
import os
import shutil
import playwright
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT.parent / '.cache' / 'felted-playwright'))
# Use the cloud image's existing FFmpeg for Playwright video capture.
registry = json.loads((Path(playwright.__file__).parent / 'driver/package/browsers.json').read_text())
revision = next(b['revision'] for b in registry['browsers'] if b['name'] == 'ffmpeg')
ffmpeg_path = Path(os.environ['PLAYWRIGHT_BROWSERS_PATH']) / f'ffmpeg-{revision}' / 'ffmpeg-linux'
if not ffmpeg_path.exists() and shutil.which('ffmpeg'):
    ffmpeg_path.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg_path.symlink_to(shutil.which('ffmpeg'))
BASE = os.environ.get('FELTED_REVIEW_URL', 'http://127.0.0.1:8081')
results = []
errors = []


def passed(name):
    results.append(name)
    print('PASS', name, flush=True)


def open_page(page, query=''):
    page.goto(BASE + '/?' + query, wait_until='networkidle')
    expect(page.get_by_text('FELTED', exact=True)).to_be_visible()
    page.evaluate('document.fonts.ready')


def overlap(a, b):
    return a['x'] < b['x'] + b['width'] - .5 and a['x'] + a['width'] > b['x'] + .5 and a['y'] < b['y'] + b['height'] - .5 and a['y'] + a['height'] > b['y'] + .5


def layout_check(page, count):
    board = page.get_by_test_id('board-stage').bounding_box()
    seats = page.locator('[data-testid^="seat-"]')
    occupied = seats.count() - (1 if count == 8 else 0) + 1
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
    for label in ['Fold', 'Call $4.60', 'Raise']:
        box = page.get_by_role('button', name=label, exact=True).bounding_box()
        assert box['y'] + box['height'] <= page.viewport_size['height'], ('action offscreen', label)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'])
    context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1,
        reduced_motion='reduce', record_video_dir=str(OUT / 'video'), record_video_size={'width': 390, 'height': 844})
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    open_page(page)
    assert page.evaluate('document.fonts.check("14px IoskeleyMedium")')
    passed('Bundled Ioskeley font loads')
    page.screenshot(path=str(OUT / 'club-390x844.png'))

    page.get_by_role('button', name='Join table', exact=True).click()
    expect(page.get_by_test_id('pot')).to_have_text('$5.20')
    page.get_by_role('button', name='Call $4.60', exact=True).click()
    expect(page.get_by_text('Submitting…', exact=True)).to_be_visible()
    expect(page.get_by_test_id('pot')).to_have_text('$9.80')
    expect(page.get_by_test_id('pot')).to_have_text('$14.40', timeout=7000)
    expect(page.get_by_text('Round complete · reset in table menu', exact=True)).to_be_visible()
    page.screenshot(path=str(OUT / 'call-accepted-390x844.png'))
    passed('Club joins playable seed; call and scripted response produce exact pots')

    page.get_by_role('button', name='Table menu', exact=True).click()
    page.get_by_role('button', name='Reset hand demo', exact=True).click()
    page.get_by_role('button', name='Raise', exact=True).click()
    amount = page.get_by_role('textbox', name='Raise total amount', exact=True)
    amount.fill('9.19')
    expect(page.get_by_text('Minimum total is $9.20.', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Raise to $9.19', exact=True)).to_be_disabled()
    amount.fill('99.81')
    expect(page.get_by_text('Maximum total is $99.80.', exact=True)).to_be_visible()
    amount.fill('9.20')
    page.screenshot(path=str(OUT / 'raise-sheet-390x844.png'))
    page.get_by_role('button', name='Raise to $9.20', exact=True).click()
    expect(page.get_by_test_id('pot')).to_have_text('$14.40')
    expect(page.get_by_test_id('pot')).to_have_text('$28.20', timeout=7000)
    passed('Raise sheet validates legal total bounds and requires explicit submission')

    open_page(page, 'screen=table&mode=demo&unopened=1')
    expect(page.get_by_role('button', name='Check', exact=True)).to_be_enabled()
    expect(page.get_by_role('button', name='Bet', exact=True)).to_be_enabled()
    page.get_by_role('button', name='Check', exact=True).click()
    expect(page.get_by_text('Round complete · reset in table menu', exact=True)).to_be_visible(timeout=7000)
    expect(page.get_by_test_id('pot')).to_have_text('$0.60')
    open_page(page, 'screen=table&mode=demo&unopened=1')
    page.get_by_role('button', name='Bet', exact=True).click()
    page.get_by_role('textbox', name='Bet amount', exact=True).fill('0.20')
    page.get_by_role('button', name='Bet $0.20', exact=True).click()
    expect(page.get_by_test_id('pot')).to_have_text('$1.20', timeout=7000)
    passed('Unopened demo offers Check / Bet with legal minimum')

    open_page(page, 'screen=table&mode=demo')
    original_seats = page.locator('[data-testid^="seat-"]').evaluate_all('(nodes) => nodes.map(n => n.dataset.testid)')
    page.get_by_role('button', name='Fold', exact=True).click()
    expect(page.get_by_text('You · folded', exact=True)).to_be_visible()
    assert original_seats == page.locator('[data-testid^="seat-"]').evaluate_all('(nodes) => nodes.map(n => n.dataset.testid)')
    passed('Folding retains seats and exposes explicit folded state')

    open_page(page, 'screen=reader')
    page.screenshot(path=str(OUT / 'reader-390x844.png'))
    page.get_by_role('button', name='Equip crest', exact=True).click()
    expect(page.get_by_role('button', name='Crest equipped', exact=True)).to_be_disabled()
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('button', name='Crest equipped', exact=True)).to_be_visible()
    page.get_by_role('button', name='View collection', exact=True).click()
    page.get_by_role('button', name='The Host, locked', exact=True).click()
    expect(page.get_by_text('Locked · 0 completed sessions', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Not yet earned', exact=True)).to_be_disabled()
    passed('Equip persists after reload; collection detail distinguishes locked objects')

    open_page(page, 'screen=table&mode=demo')
    expect(page.get_by_role('button', name='Your profile, stack $99.80, The Reader equipped', exact=True)).to_be_visible()
    page.get_by_role('button', name='Chat and reactions', exact=True).click()
    page.get_by_role('textbox', name='Message', exact=True).fill('Good to see you')
    page.get_by_role('button', name='Send message', exact=True).click()
    expect(page.get_by_text('You: Good to see you', exact=True)).to_be_visible()
    page.get_by_role('switch', name='Mute reactions', exact=True).click()
    page.get_by_role('button', name='Quiet Nod', exact=True).click()
    expect(page.get_by_text('Quiet Nod', exact=True)).not_to_be_visible()
    page.get_by_role('button', name='Table menu', exact=True).click()
    expect(page.get_by_role('switch', name='Mute reactions', exact=True)).to_be_checked()
    page.get_by_role('switch', name='Sound', exact=True).click()
    page.get_by_role('switch', name='Haptics', exact=True).click()
    page.get_by_role('switch', name='Reduce motion', exact=True).click()
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Table menu', exact=True).click()
    expect(page.get_by_role('switch', name='Sound', exact=True)).to_be_checked()
    expect(page.get_by_role('switch', name='Haptics', exact=True)).not_to_be_checked()
    expect(page.get_by_role('switch', name='Reduce motion', exact=True)).to_be_checked()
    passed('Local chat, reaction mute, sound/haptics and reduced-motion preferences persist')

    open_page(page)
    page.get_by_role('button', name='Host a game', exact=True).click()
    page.get_by_role('textbox', name='Table name', exact=True).fill('Friday friends')
    page.get_by_role('button', name='9', exact=True).click()
    page.get_by_role('button', name='Create table', exact=True).click()
    expect(page.get_by_text('Friday friends · 9 seats · $0.10 / $0.20', exact=True)).to_be_visible()
    expect(page.get_by_text('Local demo invitation', exact=True)).to_be_visible()
    page.get_by_role('button', name='Open demo table', exact=True).click()
    expect(page.get_by_text('Waiting for friends', exact=True)).to_be_visible()
    expect(page.get_by_test_id('pot')).to_have_text('$0.00')
    expect(page.get_by_role('button', name='Call $4.60', exact=True)).not_to_be_visible()
    expect(page.get_by_text('Waiting for deal', exact=True)).to_be_visible()
    page.get_by_role('button', name='Invite friends', exact=True).click()
    expect(page.get_by_text('Local demo invitation', exact=True)).to_be_visible()
    passed('Host flow creates an honest local table and demo invitation')

    # All occupancy counts, all three required logical sizes; geometry checked in DOM.
    for width, height in [(375, 667), (390, 844), (430, 932)]:
        page.set_viewport_size({'width': width, 'height': height})
        for count in range(2, 10):
            open_page(page, f'screen=table&count={count}&river=1')
            layout_check(page, count)
            if count in (2, 6, 9):
                page.screenshot(path=str(OUT / f'table-{count}players-{width}x{height}.png'))
        passed(f'{width}×{height}: 2–9 players, river, no collisions; 44-point targets')
        for screen in ['club', 'reader']:
            open_page(page, 'screen=' + screen)
            page.screenshot(path=str(OUT / f'{screen}-{width}x{height}.png'))
    page.set_viewport_size({'width': 390, 'height': 844})
    open_page(page, 'screen=table&count=8')
    page.screenshot(path=str(OUT / 'table-reference-390x844.png'))
    open_page(page, 'screen=table&count=9&river=1&long=1')
    layout_check(page, 9)
    page.screenshot(path=str(OUT / 'table-longnames-390x844.png'))
    page.get_by_test_id('seat-nico').click()
    expect(page.get_by_role('dialog').get_by_text('Nico Nightingale-Winter', exact=True)).to_be_visible()
    expect(page.get_by_role('dialog').get_by_text('$1234567.89 stack', exact=True)).to_be_visible()
    passed('Long names and large amounts have full accessible detail')
    open_page(page, 'screen=table&count=9&river=1&large=1')
    page.screenshot(path=str(OUT / 'table-accessible-list-390x844.png'))
    page.get_by_role('button', name='Players and stacks', exact=True).click()
    expect(page.get_by_role('button', name='You · $98.60', exact=True)).to_be_visible()
    passed('Simplified table exposes readable player list with Reduce Motion')

    assert not errors, errors
    passed('No browser runtime or console errors')
    video = page.video
    context.close()
    if video:
        video.save_as(str(OUT / 'interaction-review.webm'))
    browser.close()

(OUT / 'review-results.json').write_text(json.dumps({'passed': results, 'errors': errors}, indent=2) + '\n')
print(f'{len(results)} browser review groups passed. Evidence: {OUT}')
