import assert from 'node:assert/strict';
import test from 'node:test';
import { actionOptions, createDemo, money, parseAmount, previewSeats, scriptedReply, submitAction, validateAmount, visualFixture } from '../src/game';

test('playable call branch matches handoff and conserves 30000 cents at each step', () => {
  const state = createDemo();
  const total = (s: typeof state) => s.potCents + s.seats.reduce((n, seat) => n + seat.stackCents, 0);
  assert.equal(total(state), 30000);
  assert.equal(state.potCents, 520);
  assert.equal(actionOptions(state).callCents, 460);
  const called = submitAction(state, 'call');
  assert.equal(called.potCents, 980);
  assert.equal(called.seats.find(s => s.id === 'hero')!.stackCents, 9520);
  assert.equal(called.actor, 'jules');
  assert.equal(total(called), 30000);
  const complete = scriptedReply(called);
  assert.equal(complete.potCents, 1440);
  assert.deepEqual(complete.seats.map(s => s.stackCents), [9520, 9520, 9520]);
  assert.equal(complete.phase, 'complete');
  assert.equal(total(complete), 30000);
  assert.equal(visualFixture.potCents, 1490);
});
test('raise total, additional commitment, response ordering and chip conservation', () => {
  const state = createDemo(), raised = submitAction(state, 'raise', 920);
  assert.equal(raised.potCents, 1440);
  assert.equal(raised.seats[0]!.stackCents, 9060);
  assert.equal(raised.currentBetCents, 920);
  const jules = scriptedReply(raised);
  assert.equal(jules.actor, 'rune');
  const done = scriptedReply(jules);
  assert.equal(done.potCents, 2820);
  assert.equal(done.seats.reduce((sum, s) => sum + s.stackCents, done.potCents), 30000);
});
test('amounts reject subminimum, overstack, negative, fractional cents and exponent input', () => {
  const state = createDemo();
  for (const value of [919, 9981, -1, 920.1]) assert.ok(validateAmount(state, value));
  assert.equal(validateAmount(state, 920), null);
  assert.equal(validateAmount(state, 9980), null);
  for (const value of ['', '-1', 'NaN', '1e2', '9.201', '.50', '1,000', '9007199254740991']) assert.equal(parseAmount(value), null);
  assert.equal(parseAmount('9.20'), 920);
  assert.equal(parseAmount('0.1'), 10);
  assert.equal(parseAmount('4'), 400);
  assert.equal(money(460), '$4.60');
});
test('check, bet, call and raise availability follow the separate seed', () => {
  const facing = createDemo();
  assert.equal(actionOptions(facing).check, false);
  assert.throws(() => submitAction(facing, 'check'));
  assert.throws(() => submitAction(facing, 'bet', 920));
  const unopened = createDemo(true);
  assert.equal(actionOptions(unopened).check, true);
  assert.equal(actionOptions(unopened).call, false);
  assert.throws(() => submitAction(unopened, 'call'));
  assert.throws(() => submitAction(unopened, 'raise', 20));
  assert.equal(submitAction(unopened, 'check').potCents, 60);
  assert.equal(submitAction(unopened, 'bet', 20).potCents, 80);
});
test('short-stack call is explicit all-in; no unavailable full raise', () => {
  const state = createDemo(); state.seats[0]!.stackCents = 200;
  const options = actionOptions(state);
  assert.equal(options.callCents, 200); assert.equal(options.allInCall, true); assert.equal(options.raise, false);
  const called = submitAction(state, 'call');
  assert.equal(called.seats[0]!.status, 'all-in');
  assert.equal(called.seats[0]!.stackCents, 0);
});
test('accepted actions reject repeats; folded seat identity and order remain stable', () => {
  const state = createDemo(), called = submitAction(state, 'call');
  assert.throws(() => submitAction(called, 'call'), /already accepted/);
  const folded = submitAction(state, 'fold');
  assert.deepEqual(folded.seats.map(s => s.id), state.seats.map(s => s.id));
  assert.equal(folded.seats[0]!.status, 'folded');
  assert.equal(folded.potCents, state.potCents);
});
test('2–9 occupancy retains every player and full table replaces invite', () => {
  for (let count = 2; count <= 9; count++) {
    const seats = previewSeats(count);
    assert.equal(seats.filter(s => s.status !== 'empty').length + 1, count);
    assert.equal(new Set(seats.map(s => s.id)).size, seats.length);
  }
  assert.equal(previewSeats(9).some(s => s.status === 'empty'), false);
  assert.equal(previewSeats(2)[0]!.positionLabel, 'BB');
});
