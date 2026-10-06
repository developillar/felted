import {
  Card,
  compareHands,
  deck,
  evaluate,
  HandValue,
  Random,
  validCard,
} from "./cards";
import { money as dollars } from "../money";

export type Street = "preflop" | "flop" | "turn" | "river" | "showdown";
export type PokerAction = "fold" | "check" | "call" | "bet" | "raise";
export type Player = {
  id: string;
  name: string;
  avatar: string;
  stackCents: number;
  holeCards: Card[];
  status: "active" | "folded" | "all-in" | "out";
  committedCents: number;
  streetCents: number;
  lastAction: string;
};
export type Pot = { amountCents: number; eligibleIds: string[] };
export type AwardedPot = Pot & {
  winnerIds: string[];
  shares: Record<string, number>;
};
export type HandResult = {
  reason: "fold" | "showdown";
  potCents: number;
  pots: AwardedPot[];
  hands: Record<string, HandValue>;
  awards: Record<string, number>;
  winnerIds: string[];
};
export type HandEvent = { id: number; street: Street; text: string };
export type Hand = {
  number: number;
  revision: number;
  tableName: string;
  players: Player[];
  dealerIndex: number;
  smallBlindCents: number;
  bigBlindCents: number;
  initialChipsCents: number;
  board: Card[];
  deck: Card[];
  burned: Card[];
  street: Street;
  phase: "betting" | "runout" | "complete";
  actorId: string | null;
  currentBetCents: number;
  lastFullRaiseCents: number;
  actedAtBet: Record<string, number>;
  events: HandEvent[];
  result: HandResult | null;
};
export type PlayerInput = Pick<Player, "id" | "name" | "avatar" | "stackCents">;
export type StartOptions = {
  tableName?: string;
  dealerIndex?: number;
  smallBlindCents?: number;
  bigBlindCents?: number;
  random?: Random;
  deck?: Card[];
};

const profiles = [
  { id: "hero", name: "You", avatar: "black-cat-knit" },
  { id: "nico", name: "Nico", avatar: "cloth-ghost" },
  { id: "rune", name: "Rune", avatar: "fox-glasses" },
  { id: "ava", name: "Ava", avatar: "purple-headphones" },
  { id: "theo", name: "Theo", avatar: "cap-skater" },
  { id: "mina", name: "Mina", avatar: "rabbit" },
  { id: "sol", name: "Sol", avatar: "frog-knit" },
  { id: "jules", name: "Jules", avatar: "helmet" },
  { id: "luca", name: "Luca", avatar: "cap-skater" },
];
export function practicePlayers(count = 6, stackCents = 10000): PlayerInput[] {
  if (!Number.isInteger(count) || count < 2 || count > 9)
    throw new Error("Choose two to nine players.");
  return profiles
    .slice(0, count)
    .map((profile) => ({ ...profile, stackCents }));
}
export function potTotal(hand: Hand) {
  return hand.players.reduce((sum, player) => sum + player.committedCents, 0);
}
function live(hand: Hand) {
  return hand.players.filter(
    (player) => player.holeCards.length === 2 && player.status !== "folded",
  );
}
function active(hand: Hand) {
  return live(hand).filter((player) => player.stackCents > 0);
}
function nextIndex(
  hand: Pick<Hand, "players">,
  from: number,
  predicate: (player: Player) => boolean,
): number {
  for (let offset = 1; offset <= hand.players.length; offset++) {
    const index = (from + offset + hand.players.length) % hand.players.length;
    if (predicate(hand.players[index]!)) return index;
  }
  throw new Error("No eligible player.");
}
function record(hand: Hand, text: string) {
  hand.events.push({ id: hand.events.length, street: hand.street, text });
}
function pay(player: Player, cents: number) {
  player.stackCents -= cents;
  player.committedCents += cents;
  player.streetCents += cents;
  if (player.stackCents === 0) player.status = "all-in";
}
function copy(hand: Hand): Hand {
  return {
    ...hand,
    revision: hand.revision + 1,
    players: hand.players.map((player) => ({
      ...player,
      holeCards: [...player.holeCards],
    })),
    board: [...hand.board],
    deck: [...hand.deck],
    burned: [...hand.burned],
    actedAtBet: { ...hand.actedAtBet },
    events: [...hand.events],
  };
}

export function positions(hand: Hand): Record<string, string> {
  const seated = hand.players.filter((player) => player.holeCards.length === 2);
  if (seated.length < 2) return {};
  const sb =
    seated.length === 2
      ? hand.dealerIndex
      : nextIndex(
          hand,
          hand.dealerIndex,
          (player) => player.holeCards.length === 2,
        );
  const bb = nextIndex(hand, sb, (player) => player.holeCards.length === 2);
  return {
    [hand.players[hand.dealerIndex]!.id]: seated.length === 2 ? "D / SB" : "D",
    [hand.players[sb]!.id]: seated.length === 2 ? "D / SB" : "SB",
    [hand.players[bb]!.id]: "BB",
  };
}

export function startHand(
  players: PlayerInput[],
  options: StartOptions = {},
): Hand {
  const sb = options.smallBlindCents ?? 10,
    bb = options.bigBlindCents ?? 20;
  if (
    players.length < 2 ||
    players.length > 9 ||
    new Set(players.map((player) => player.id)).size !== players.length ||
    players.some(
      (player) =>
        !player.id ||
        !Number.isSafeInteger(player.stackCents) ||
        player.stackCents < 0,
    ) ||
    players.filter((player) => player.stackCents > 0).length < 2
  )
    throw new Error(
      "A hand needs two to nine unique seats and at least two funded players.",
    );
  if (
    !Number.isSafeInteger(sb) ||
    !Number.isSafeInteger(bb) ||
    sb <= 0 ||
    bb < sb ||
    !Number.isSafeInteger(
      players.reduce((sum, player) => sum + player.stackCents, 0),
    )
  )
    throw new Error("Invalid blinds or chip total.");
  const hand: Hand = {
    number: 1,
    revision: 0,
    tableName: options.tableName ?? "The Night Shift",
    players: players.map((player) => ({
      ...player,
      holeCards: [],
      status: player.stackCents ? "active" : "out",
      committedCents: 0,
      streetCents: 0,
      lastAction: "",
    })),
    dealerIndex: options.dealerIndex ?? 0,
    smallBlindCents: sb,
    bigBlindCents: bb,
    initialChipsCents: players.reduce(
      (sum, player) => sum + player.stackCents,
      0,
    ),
    board: [],
    deck: options.deck ? [...options.deck] : deck(options.random),
    burned: [],
    street: "preflop",
    phase: "betting",
    actorId: null,
    currentBetCents: bb,
    lastFullRaiseCents: bb,
    actedAtBet: {},
    events: [],
    result: null,
  };
  if (
    !Number.isInteger(hand.dealerIndex) ||
    hand.dealerIndex < 0 ||
    hand.dealerIndex >= players.length
  )
    throw new Error("Invalid dealer seat.");
  if (
    hand.deck.length !== 52 ||
    hand.deck.some((card) => !validCard(card)) ||
    new Set(hand.deck).size !== 52
  )
    throw new Error("A deck must contain all 52 unique cards.");
  if (!hand.players[hand.dealerIndex]!.stackCents)
    hand.dealerIndex = nextIndex(
      hand,
      hand.dealerIndex,
      (player) => player.stackCents > 0,
    );
  let index = hand.dealerIndex;
  for (let round = 0; round < 2; round++)
    for (
      let count = 0;
      count < players.filter((player) => player.stackCents > 0).length;
      count++
    ) {
      index = nextIndex(hand, index, (player) => player.stackCents > 0);
      hand.players[index]!.holeCards.push(hand.deck.shift()!);
    }
  const labels = positions(hand);
  const small = hand.players.find((player) =>
    labels[player.id]?.includes("SB"),
  )!;
  const big = hand.players.find((player) => labels[player.id] === "BB")!;
  for (const [player, blind, label] of [
    [small, sb, "small blind"],
    [big, bb, "big blind"],
  ] as const) {
    const paid = Math.min(player.stackCents, blind);
    pay(player, paid);
    player.lastAction = "Blind";
    record(hand, `${player.name} posts ${label} ${dollars(paid)}`);
  }
  progress(hand, hand.players.indexOf(big));
  assertHand(hand);
  return hand;
}

export function legalActions(hand: Hand, id: string) {
  const player = hand.players.find((seat) => seat.id === id);
  const enabled =
    !!player &&
    hand.phase === "betting" &&
    hand.actorId === id &&
    player.status === "active" &&
    player.stackCents > 0;
  const contributed = player?.streetCents ?? 0,
    owed = Math.max(0, hand.currentBetCents - contributed);
  const maximum = contributed + (player?.stackCents ?? 0);
  const fullMinimum =
    hand.currentBetCents === 0
      ? hand.bigBlindCents
      : hand.currentBetCents + hand.lastFullRaiseCents;
  const reopened =
    hand.actedAtBet[id] === undefined ||
    hand.currentBetCents - hand.actedAtBet[id]! >= hand.lastFullRaiseCents;
  const raise =
    enabled &&
    reopened &&
    maximum > hand.currentBetCents &&
    active(hand).some((seat) => seat.id !== id);
  return {
    active: enabled,
    owed,
    callCents: Math.min(owed, player?.stackCents ?? 0),
    check: enabled && owed === 0,
    call: enabled && owed > 0,
    fold: enabled,
    raise,
    minimum: Math.min(fullMinimum, maximum),
    fullMinimum,
    maximum,
    contributed,
    reopened,
    shortAllIn: maximum < fullMinimum,
    allInCall: owed > 0 && owed >= (player?.stackCents ?? 0),
  };
}
export function validateWager(
  hand: Hand,
  id: string,
  amount: number | null,
): string | null {
  const bounds = legalActions(hand, id);
  if (!bounds.active) return "Wait for your turn.";
  if (!bounds.raise)
    return bounds.reopened
      ? "No opponent can respond to a raise."
      : "A short all-in has not reopened your raise.";
  if (amount === null || !Number.isSafeInteger(amount))
    return "Enter dollars with at most two decimal places.";
  if (amount > bounds.maximum)
    return `Maximum total is ${dollars(bounds.maximum)}.`;
  if (amount < bounds.minimum)
    return `Minimum total is ${dollars(bounds.minimum)}.`;
  return null;
}

export function act(
  hand: Hand,
  id: string,
  action: PokerAction,
  amount?: number,
): Hand {
  const bounds = legalActions(hand, id);
  if (!bounds.active)
    throw new Error("Action already accepted or not your turn.");
  if (!["fold", "check", "call", "bet", "raise"].includes(action))
    throw new Error("Unknown action.");
  if (action === "check" && !bounds.check)
    throw new Error("Cannot check while facing a bet.");
  if (action === "call" && !bounds.call) throw new Error("Nothing to call.");
  const aggressive = action === "bet" || action === "raise";
  if (aggressive) {
    if ((action === "bet") !== (hand.currentBetCents === 0))
      throw new Error(
        hand.currentBetCents
          ? "Use raise when facing a bet."
          : "Use bet on an unopened street.",
      );
    const error = validateWager(hand, id, amount ?? null);
    if (error) throw new Error(error);
  }
  const next = copy(hand),
    index = next.players.findIndex((player) => player.id === id),
    player = next.players[index]!;
  const added =
    action === "call"
      ? bounds.callCents
      : aggressive
        ? amount! - player.streetCents
        : 0;
  if (action === "fold") player.status = "folded";
  if (added) pay(player, added);
  player.lastAction =
    player.status === "all-in"
      ? "All-in"
      : action[0]!.toUpperCase() + action.slice(1);
  if (aggressive) {
    const increase = amount! - next.currentBetCents;
    if (increase >= next.lastFullRaiseCents) next.lastFullRaiseCents = increase;
    next.currentBetCents = amount!;
  }
  next.actedAtBet[id] = next.currentBetCents;
  record(
    next,
    `${player.name} ${action === "raise" ? `raises to ${dollars(amount!)}` : action === "bet" ? `bets ${dollars(amount!)}` : action === "call" ? `calls ${dollars(added)}` : action === "fold" ? "folds" : "checks"}${player.status === "all-in" ? " · all-in" : ""}`,
  );
  progress(next, index);
  assertHand(next);
  return next;
}

function progress(hand: Hand, after: number) {
  if (live(hand).length === 1) {
    settle(hand, "fold");
    return;
  }
  const actionable = active(hand);
  const needsAction = (player: Player) =>
    player.status === "active" &&
    player.holeCards.length === 2 &&
    (hand.actedAtBet[player.id] === undefined ||
      player.streetCents < hand.currentBetCents);
  if (
    actionable.length <= 1 &&
    (!actionable[0] || actionable[0].streetCents >= hand.currentBetCents)
  ) {
    if (hand.board.length === 5) settle(hand, "showdown");
    else {
      hand.phase = "runout";
      hand.actorId = null;
      record(hand, "Betting complete · running out the board");
    }
    return;
  }
  if (hand.players.some(needsAction)) {
    hand.actorId = hand.players[nextIndex(hand, after, needsAction)]!.id;
    return;
  }
  if (hand.street === "river") {
    settle(hand, "showdown");
    return;
  }
  dealStreet(hand);
  hand.actorId =
    hand.players[
      nextIndex(
        hand,
        hand.dealerIndex,
        (player) => player.status === "active" && player.holeCards.length === 2,
      )
    ]!.id;
}
function dealStreet(hand: Hand) {
  hand.burned.push(hand.deck.shift()!);
  const count = hand.board.length === 0 ? 3 : 1;
  for (let i = 0; i < count; i++) hand.board.push(hand.deck.shift()!);
  hand.street =
    hand.board.length === 3
      ? "flop"
      : hand.board.length === 4
        ? "turn"
        : "river";
  hand.currentBetCents = 0;
  hand.lastFullRaiseCents = hand.bigBlindCents;
  hand.actedAtBet = {};
  for (const player of hand.players) {
    player.streetCents = 0;
    if (player.status === "active") player.lastAction = "";
  }
  record(
    hand,
    `${hand.street[0]!.toUpperCase() + hand.street.slice(1)} · ${hand.board.join(" ")}`,
  );
}
export function advanceRunout(hand: Hand): Hand {
  if (hand.phase !== "runout" || hand.board.length >= 5)
    throw new Error("No board runout is pending.");
  const next = copy(hand);
  dealStreet(next);
  if (next.board.length === 5) settle(next, "showdown");
  assertHand(next);
  return next;
}

/** Folded commitments fund pots, but folded players can never win them. */
export function buildPots(
  players: Pick<Player, "id" | "committedCents" | "status">[],
): Pot[] {
  const levels = [
    ...new Set(
      players
        .map((player) => player.committedCents)
        .filter((cents) => cents > 0),
    ),
  ].sort((a, b) => a - b);
  let previous = 0;
  const pots: Pot[] = [];
  for (const level of levels) {
    const contributors = players.filter(
      (player) => player.committedCents >= level,
    );
    const pot = {
      amountCents: (level - previous) * contributors.length,
      eligibleIds: contributors
        .filter(
          (player) => player.status !== "folded" && player.status !== "out",
        )
        .map((player) => player.id),
    };
    previous = level;
    // A folded player's contribution level doesn't create a new side pot when
    // the eligible players are unchanged. Merge those adjacent funding tiers.
    const last = pots[pots.length - 1];
    if (last && last.eligibleIds.join("\0") === pot.eligibleIds.join("\0"))
      last.amountCents += pot.amountCents;
    else pots.push(pot);
  }
  return pots;
}
function settle(hand: Hand, reason: HandResult["reason"]) {
  // Return the unmatched top commitment before constructing contested pots.
  const sorted = [...hand.players].sort(
    (a, b) => b.committedCents - a.committedCents,
  );
  const refund = sorted[0]!.committedCents - sorted[1]!.committedCents;
  if (refund > 0) {
    const player = sorted[0]!;
    player.committedCents -= refund;
    player.stackCents += refund;
    record(hand, `${player.name} receives uncalled ${dollars(refund)} back`);
  }
  const hands: Record<string, HandValue> = {};
  if (reason === "showdown")
    for (const player of live(hand))
      hands[player.id] = evaluate([...player.holeCards, ...hand.board]);
  const awards: Record<string, number> = {};
  const pots: AwardedPot[] = buildPots(hand.players).map((pot) => {
    if (pot.eligibleIds.length === 0)
      throw new Error("A pot must have an eligible winner.");
    let winnerIds = [pot.eligibleIds[0]!];
    if (reason === "showdown")
      for (const id of pot.eligibleIds.slice(1)) {
        const comparison = compareHands(hands[id]!, hands[winnerIds[0]!]!);
        if (comparison > 0) winnerIds = [id];
        else if (comparison === 0) winnerIds.push(id);
      }
    // Odd cents go clockwise from the first seat left of the button.
    winnerIds.sort(
      (a, b) =>
        ((hand.players.findIndex((player) => player.id === a) -
          hand.dealerIndex -
          1 +
          hand.players.length) %
          hand.players.length) -
        ((hand.players.findIndex((player) => player.id === b) -
          hand.dealerIndex -
          1 +
          hand.players.length) %
          hand.players.length),
    );
    const shares: Record<string, number> = {};
    winnerIds.forEach((id, index) => {
      shares[id] =
        Math.floor(pot.amountCents / winnerIds.length) +
        (index < pot.amountCents % winnerIds.length ? 1 : 0);
      awards[id] = (awards[id] ?? 0) + shares[id]!;
    });
    return { ...pot, winnerIds, shares };
  });
  const potCents = pots.reduce((sum, pot) => sum + pot.amountCents, 0);
  hand.result = {
    reason,
    hands,
    pots,
    potCents,
    awards,
    winnerIds: Object.keys(awards),
  };
  for (const player of hand.players) {
    player.stackCents += awards[player.id] ?? 0;
    player.committedCents = 0;
    player.streetCents = 0;
  }
  hand.phase = "complete";
  hand.street = reason === "showdown" ? "showdown" : hand.street;
  hand.actorId = null;
  record(
    hand,
    Object.entries(awards)
      .map(
        ([id, amount]) =>
          `${hand.players.find((player) => player.id === id)!.name} wins ${dollars(amount)}${hands[id] ? ` · ${hands[id]!.name}` : " · everyone folded"}`,
      )
      .join(" / "),
  );
}

export function nextHand(hand: Hand, random: Random = Math.random): Hand {
  if (hand.phase !== "complete") throw new Error("Finish this hand first.");
  const dealerIndex = nextIndex(
    hand,
    hand.dealerIndex,
    (player) => player.stackCents > 0,
  );
  const next = startHand(hand.players, {
    tableName: hand.tableName,
    dealerIndex,
    smallBlindCents: hand.smallBlindCents,
    bigBlindCents: hand.bigBlindCents,
    random,
  });
  next.number = hand.number + 1;
  next.revision = hand.revision + 1;
  return next;
}

export function assertHand(hand: Hand) {
  if (
    !Array.isArray(hand.players) ||
    hand.players.length < 2 ||
    hand.players.length > 9 ||
    new Set(hand.players.map((player) => player.id)).size !==
      hand.players.length ||
    !Number.isInteger(hand.dealerIndex) ||
    hand.dealerIndex < 0 ||
    hand.dealerIndex >= hand.players.length
  )
    throw new Error("Invalid seats.");
  if (
    !["preflop", "flop", "turn", "river", "showdown"].includes(hand.street) ||
    !["betting", "runout", "complete"].includes(hand.phase) ||
    !Number.isSafeInteger(hand.number) ||
    hand.number < 1 ||
    !Number.isSafeInteger(hand.revision) ||
    hand.revision < 0
  )
    throw new Error("Invalid hand progress.");
  if (
    !Number.isSafeInteger(hand.initialChipsCents) ||
    !Number.isSafeInteger(hand.smallBlindCents) ||
    hand.smallBlindCents <= 0 ||
    !Number.isSafeInteger(hand.bigBlindCents) ||
    hand.bigBlindCents < hand.smallBlindCents ||
    !Number.isSafeInteger(hand.currentBetCents) ||
    hand.currentBetCents < 0 ||
    !Number.isSafeInteger(hand.lastFullRaiseCents) ||
    hand.lastFullRaiseCents < hand.bigBlindCents
  )
    throw new Error("Invalid betting state.");
  if (
    !Array.isArray(hand.events) ||
    !hand.actedAtBet ||
    Object.values(hand.actedAtBet).some(
      (value) => !Number.isSafeInteger(value) || value < 0,
    )
  )
    throw new Error("Invalid action history.");
  const total = hand.players.reduce(
    (sum, player) => sum + player.stackCents + player.committedCents,
    0,
  );
  if (total !== hand.initialChipsCents)
    throw new Error("Chips must be conserved.");
  for (const player of hand.players) {
    for (const amount of [
      player.stackCents,
      player.committedCents,
      player.streetCents,
    ])
      if (!Number.isSafeInteger(amount) || amount < 0)
        throw new Error("Chip amounts must be nonnegative integer cents.");
    if (
      !["active", "folded", "all-in", "out"].includes(player.status) ||
      !Array.isArray(player.holeCards) ||
      ![0, 2].includes(player.holeCards.length) ||
      player.streetCents > player.committedCents
    )
      throw new Error("Invalid player state.");
  }
  const cards = [
    ...hand.deck,
    ...hand.burned,
    ...hand.board,
    ...hand.players.flatMap((player) => player.holeCards),
  ];
  if (
    cards.length !== 52 ||
    new Set(cards).size !== 52 ||
    cards.some((card) => !validCard(card))
  )
    throw new Error("Every card must have exactly one location.");
  if (hand.actorId && !legalActions(hand, hand.actorId).active)
    throw new Error("Only a funded, active player may act.");
  if (hand.phase === "betting" && !hand.actorId)
    throw new Error("A betting hand needs an actor.");
  if (hand.phase !== "betting" && hand.actorId)
    throw new Error("No action is allowed after betting ends.");
  if (hand.phase === "complete" && (!hand.result || potTotal(hand) !== 0))
    throw new Error("Completed pots must be awarded.");
}
