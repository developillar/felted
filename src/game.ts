import playable from '../design/felted/fixtures/playable-flop-seed.json';
import visual from '../design/felted/fixtures/visual-postflop.json';

export type Seat = {
  id: string; name: string; stackCents: number; avatar?: string;
  status?: string; positionLabel?: string; displayAction?: string;
  displayContributionCents?: number; streetContributionCents?: number;
  lastAction?: string;
};
export type DemoState = {
  seats: Seat[]; potCents: number; currentBetCents: number;
  lastRaiseCents: number; actor: string | null; phase: 'acting' | 'complete';
  board: string[]; message: string;
};
export type Action = 'fold' | 'check' | 'call' | 'raise' | 'bet';
export const visualFixture = visual;
export const DEMO_TURN_SECONDS = 120;

export function money(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error('Money must use integer cents');
  return `$${(cents / 100).toFixed(2)}`;
}
export function compactMoney(cents: number): string {
  if (cents < 10000000) return money(cents);
  return `$${(cents / 100000000).toFixed(2)}m`;
}
export function parseAmount(input: string): number | null {
  if (!/^\d+(\.\d{0,2})?$/.test(input.trim())) return null;
  const [whole = '0', fraction = ''] = input.trim().split('.');
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(n) ? n : null;
}
export function createDemo(unopened = false): DemoState {
  return {
    seats: playable.seats.map(s => ({ ...s,
      stackCents: unopened ? 9980 : s.stackCents,
      streetContributionCents: unopened ? 0 : s.streetContributionCents,
      lastAction: unopened ? undefined : s.lastAction,
      positionLabel: s.id === 'hero' ? 'D' : s.id === 'jules' ? 'SB' : 'BB',
    })),
    potCents: unopened ? 60 : playable.potCents,
    currentBetCents: unopened ? 0 : playable.currentBetToMatchCents,
    lastRaiseCents: unopened ? 20 : playable.lastFullRaiseIncrementCents,
    actor: 'hero', phase: 'acting', board: [...playable.board], message: 'Your turn',
  };
}
export function actionOptions(state: DemoState) {
  const hero = state.seats.find(s => s.id === 'hero')!;
  const contributed = hero.streetContributionCents ?? 0;
  const owed = Math.max(0, state.currentBetCents - contributed);
  const minimum = state.currentBetCents === 0 ? 20 : state.currentBetCents + state.lastRaiseCents;
  const maximum = hero.stackCents + contributed;
  const active = state.actor === 'hero' && state.phase === 'acting' && hero.status !== 'folded';
  return { active, owed, callCents: Math.min(owed, hero.stackCents),
    check: active && owed === 0, call: active && owed > 0,
    raise: active && maximum >= minimum && hero.stackCents > owed,
    minimum, maximum, contributed, allInCall: owed >= hero.stackCents,
  };
}
export function validateAmount(state: DemoState, amount: number | null): string | null {
  const o = actionOptions(state);
  if (!o.active) return 'Wait for your turn.';
  if (!o.raise) return 'A full raise is unavailable in this demo state.';
  if (amount === null || !Number.isSafeInteger(amount)) return 'Enter dollars with at most two decimal places.';
  if (amount < o.minimum) return `Minimum total is ${money(o.minimum)}.`;
  if (amount > o.maximum) return `Maximum total is ${money(o.maximum)}.`;
  return null;
}
export function submitAction(state: DemoState, action: Action, amount?: number): DemoState {
  const o = actionOptions(state);
  if (!o.active) throw new Error('Action already accepted or not your turn');
  if (action === 'check' && !o.check) throw new Error('Cannot check while facing a bet');
  if (action === 'call' && !o.call) throw new Error('Nothing to call');
  if (action === 'bet' && state.currentBetCents !== 0) throw new Error('Use raise when facing a bet');
  if (action === 'raise' && state.currentBetCents === 0) throw new Error('Use bet on an unopened street');
  if (action === 'raise' || action === 'bet') {
    const error = validateAmount(state, amount ?? null);
    if (error) throw new Error(error);
  }
  const added = action === 'call' ? o.callCents : (action === 'raise' || action === 'bet') ? amount! - o.contributed : 0;
  const seats = state.seats.map(s => s.id === 'hero' ? {
    ...s, stackCents: s.stackCents - added,
    streetContributionCents: (s.streetContributionCents ?? 0) + added,
    status: action === 'fold' ? 'folded' : s.stackCents === added ? 'all-in' : 'active',
    lastAction: action, displayContributionCents: added > 0 ? added : undefined,
  } : { ...s });
  return { ...state, seats, potCents: state.potCents + added,
    currentBetCents: amount ?? state.currentBetCents,
    lastRaiseCents: amount === undefined ? state.lastRaiseCents : amount - state.currentBetCents,
    actor: 'jules', message: `${action === 'fold' ? 'Fold' : action === 'check' ? 'Check' : action === 'call' ? 'Call' : 'Amount'} accepted · waiting for Jules`,
  };
}
// Deliberate fixture responses only. No dealing, winners, side pots or engine claims.
export function scriptedReply(state: DemoState): DemoState {
  if (state.actor !== 'jules' && state.actor !== 'rune') throw new Error('No scripted response available');
  const actor = state.actor;
  const seat = state.seats.find(s => s.id === actor)!;
  const owed = Math.max(0, state.currentBetCents - (seat.streetContributionCents ?? 0));
  const added = Math.min(owed, seat.stackCents);
  const seats = state.seats.map(s => s.id === actor ? {
    ...s, stackCents: s.stackCents - added,
    streetContributionCents: (s.streetContributionCents ?? 0) + added,
    lastAction: added ? 'call' : 'check',
  } : { ...s });
  const rune = seats.find(s => s.id === 'rune')!;
  const needRune = actor === 'jules' && (rune.streetContributionCents ?? 0) < state.currentBetCents;
  return { ...state, seats, potCents: state.potCents + added,
    actor: needRune ? 'rune' : null, phase: needRune ? 'acting' : 'complete',
    message: needRune ? 'Jules called · waiting for Rune' : 'Round complete · reset in table menu',
  };
}

export function previewSeats(count: number, longNames = false): Seat[] {
  if (count < 2 || count > 9) throw new Error('Occupancy must be 2–9');
  const byId = Object.fromEntries(visual.seats.map(s => [s.id, s]));
  const ids = count === 8
    ? visual.clockwiseSeatOrder.filter(id => id !== 'hero')
    : count === 2 ? ['rune']
    : ['nico', 'rune', 'ava', 'theo', 'mina', 'sol', 'jules', 'extra'].slice(0, count - 1);
  return ids.map((id, i) => {
    const source = byId[id]!;
    const s: Seat = id === 'extra' ? { id, name: 'Luca', stackCents: 5400, avatar: 'cap-skater', status: 'active' } : { ...source, stackCents: source.stackCents ?? 0 };
    if (count === 2) s.positionLabel = 'BB';
    if (longNames && id !== 'empty') { s.name = `${s.name} Nightingale-Winter`; s.stackCents = 123456789; }
    return s;
  });
}
