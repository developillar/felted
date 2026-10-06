import assert from "node:assert/strict";
import test from "node:test";
import { compareHands, deck, evaluate } from "../src/poker/cards";
import {
  act,
  advanceRunout,
  assertHand,
  buildPots,
  Hand,
  legalActions,
  nextHand,
  positions,
  potTotal,
  practicePlayers,
  startHand,
  validateWager,
} from "../src/poker/engine";
import { chooseBotAction } from "../src/poker/bots";

function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const cards = (text: string) => text.split(" ");
function players(stacks: number[]) {
  return practicePlayers(stacks.length).map((player, index) => ({
    ...player,
    stackCents: stacks[index]!,
  }));
}
function finish(hand: Hand): Hand {
  let count = 0;
  while (hand.phase !== "complete") {
    assert.ok(++count < 200, "hand must terminate");
    if (hand.phase === "runout") hand = advanceRunout(hand);
    else {
      const o = legalActions(hand, hand.actorId!);
      hand = act(hand, hand.actorId!, o.check ? "check" : "call");
    }
  }
  return hand;
}
function riggedDeck(prefix: string) {
  const chosen = cards(prefix);
  return [
    ...chosen,
    ...deck(random(1)).filter((card) => !chosen.includes(card)),
  ];
}

test("all hand categories, ace-low straights, kickers and best five of seven", () => {
  const cases = [
    ["As Qd 9c 7h 3s", 0],
    ["As Ad Qc 7h 3s", 1],
    ["As Ad Qc Qh 3s", 2],
    ["As Ad Ac 7h 3s", 3],
    ["As 2d 3c 4h 5s", 4],
    ["As Js 9s 7s 3s", 5],
    ["As Ad Ac 7h 7s", 6],
    ["As Ad Ac Ah 3s", 7],
    ["9s Ts Js Qs Ks", 8],
  ] as const;
  for (const [hand, category] of cases)
    assert.equal(evaluate(cards(hand)).category, category, hand);
  assert.equal(evaluate(cards("As Ks Qs Js Ts 2c 3d")).name, "Royal flush");
  assert.equal(
    evaluate(cards("As Ad Ac Ks Kd Kc 2h")).kickers.join(","),
    "14,13",
  );
  assert.equal(
    evaluate(cards("As Ad Ks Kd Qs Qd 2h")).kickers.join(","),
    "14,13,12",
  );
  assert.ok(
    compareHands(
      evaluate(cards("2s 3s 4s 5s 6s")),
      evaluate(cards("As 2s 3s 4s 5s")),
    ) > 0,
  );
  assert.ok(
    compareHands(
      evaluate(cards("As Ad Kc 7h 3s")),
      evaluate(cards("Ah Ac Qc Jh Ts")),
    ) > 0,
  );
  assert.equal(
    compareHands(
      evaluate(cards("As Ks Qs Js Ts 2c 3d")),
      evaluate(cards("As Ks Qs Js Ts 4c 5d")),
    ),
    0,
  );
  assert.throws(() => evaluate(cards("As As 2s 3s 4s")), /distinct/);
  assert.throws(() => evaluate(cards("10s Js Qs Ks As")), /valid/);
});

test("heads-up dealer posts small blind, acts first preflop and last postflop", () => {
  let hand = startHand(players([1000, 1000]), { random: random(1) });
  assert.deepEqual(positions(hand), { hero: "D / SB", nico: "BB" });
  assert.equal(hand.actorId, "hero");
  assert.equal(potTotal(hand), 30);
  hand = act(hand, "hero", "call");
  assert.equal(hand.actorId, "nico");
  assert.equal(legalActions(hand, "nico").check, true);
  hand = act(hand, "nico", "check");
  assert.equal(hand.street, "flop");
  assert.equal(hand.actorId, "nico");
  assert.equal(hand.board.length, 3);
  const complete = finish(hand),
    next = nextHand(complete, random(2));
  assert.equal(next.number, 2);
  assert.equal(next.dealerIndex, 1);
  assert.equal(next.actorId, "nico");
});

test("multiway blinds, big blind option, exact pot and immutable action state", () => {
  const initial = startHand(players([1000, 1000, 1000]), { random: random(3) });
  assert.equal(initial.actorId, "hero");
  assert.deepEqual(positions(initial), { hero: "D", nico: "SB", rune: "BB" });
  const original = JSON.stringify(initial);
  let hand = act(initial, "hero", "call");
  assert.equal(JSON.stringify(initial), original);
  assert.equal(potTotal(hand), 50);
  assert.throws(() => act(hand, "hero", "call"), /not your turn/);
  assert.throws(() => act(hand, "nico", "check"), /facing a bet/);
  hand = act(hand, "nico", "call");
  assert.equal(hand.actorId, "rune");
  hand = act(hand, "rune", "check");
  assert.equal(hand.street, "flop");
  assert.equal(potTotal(hand), 60);
  assert.equal(hand.actorId, "nico");
  assert.equal(hand.burned.length, 1);
});

test("short all-in does not reopen a prior actor; unacted seats can raise", () => {
  let hand = startHand(players([1000, 1000, 130]), { random: random(4) });
  hand = act(hand, "hero", "raise", 100);
  hand = act(hand, "nico", "call");
  hand = act(hand, "rune", "raise", 130);
  assert.equal(hand.lastFullRaiseCents, 80);
  assert.equal(hand.actorId, "hero");
  assert.equal(legalActions(hand, "hero").raise, false);
  assert.match(validateWager(hand, "hero", 210)!, /not reopened/);
  hand = act(hand, "hero", "call");
  hand = act(hand, "nico", "call");
  assert.equal(hand.street, "flop");
  assert.equal(legalActions(hand, "nico").raise, true);
  let unacted = startHand(players([1000, 1000, 130, 1000]), {
    random: random(5),
  });
  unacted = act(unacted, "ava", "raise", 100);
  unacted = act(unacted, "hero", "call");
  unacted = act(unacted, "nico", "call");
  unacted = act(unacted, "rune", "raise", 130);
  assert.equal(legalActions(unacted, "ava").raise, false);
});

test("cumulative short all-ins reopen action once a full raise is faced", () => {
  let hand = startHand(players([130, 180, 1000, 1000]), { random: random(6) });
  hand = act(hand, "ava", "raise", 100);
  hand = act(hand, "hero", "raise", 130);
  assert.equal(legalActions(hand, "nico").raise, true); // has not acted yet
  hand = act(hand, "nico", "raise", 180);
  hand = act(hand, "rune", "call");
  assert.equal(hand.actorId, "ava");
  assert.equal(legalActions(hand, "ava").raise, true);
  assert.equal(legalActions(hand, "ava").minimum, 260);
});

test("under-minimum wagers are allowed only when all-in; unsafe amounts rejected", () => {
  let hand = startHand(players([70, 1000, 1000]), { random: random(7) });
  assert.throws(() => act(hand, "hero", "raise", 39), /Minimum/);
  assert.throws(() => act(hand, "hero", "raise", 40.5), /decimal/);
  assert.throws(() => act(hand, "hero", "raise", 71), /Maximum/);
  hand = act(hand, "hero", "raise", 60);
  hand = act(hand, "nico", "raise", 100);
  hand = act(hand, "rune", "call");
  const o = legalActions(hand, "hero");
  assert.equal(o.allInCall, true);
  assert.equal(o.callCents, 10);
  hand = act(hand, "hero", "call");
  assert.equal(hand.players[0]!.status, "all-in");
  assertHand(finish(hand));
});

test("uncalled raise is returned; remaining contested pot awarded after folds", () => {
  let hand = startHand(players([1000, 1000, 1000]), { random: random(8) });
  hand = act(hand, "hero", "raise", 500);
  hand = act(hand, "nico", "fold");
  hand = act(hand, "rune", "fold");
  assert.equal(hand.phase, "complete");
  assert.equal(hand.result!.reason, "fold");
  assert.equal(hand.result!.potCents, 50);
  assert.equal(hand.players[0]!.stackCents, 1030);
  assert.equal(hand.players[1]!.stackCents, 990);
  assert.equal(hand.players[2]!.stackCents, 980);
  assert.ok(hand.events.some((event) => event.text.includes("uncalled $4.80")));
  assertHand(hand);
});

test("side pots retain folded chips and exclude folded winners", () => {
  assert.deepEqual(
    buildPots([
      { id: "a", committedCents: 100, status: "all-in" },
      { id: "b", committedCents: 300, status: "all-in" },
      { id: "c", committedCents: 300, status: "active" },
      { id: "d", committedCents: 200, status: "folded" },
    ]),
    [
      { amountCents: 400, eligibleIds: ["a", "b", "c"] },
      { amountCents: 500, eligibleIds: ["b", "c"] },
    ],
  );
});

test("showdown pays main and side pots to different hands and preserves every chip", () => {
  // Deal starts left of button: Nico KK, Rune QQ, Hero AA. Board is dry.
  let hand = startHand(players([100, 300, 500]), {
    deck: riggedDeck("Ks Qs As Kh Qh Ah 9c 2s 5d 8c Tc Jd 6h 3c"),
  });
  hand = act(hand, "hero", "raise", 100);
  hand = act(hand, "nico", "raise", 300);
  hand = act(hand, "rune", "call");
  hand = finish(hand);
  assert.equal(hand.result!.pots[0]!.amountCents, 300);
  assert.deepEqual(hand.result!.pots[0]!.winnerIds, ["hero"]);
  assert.equal(hand.result!.pots[1]!.amountCents, 400);
  assert.deepEqual(hand.result!.pots[1]!.winnerIds, ["nico"]);
  assert.deepEqual(
    hand.players.map((player) => player.stackCents),
    [300, 400, 200],
  );
  assert.equal(hand.board.length, 5);
  assert.equal(hand.burned.length, 3);
  assertHand(hand);
});

test("board ties split pots; odd cents start left of dealer", () => {
  let hand = startHand(players([10, 10, 10]), {
    smallBlindCents: 1,
    bigBlindCents: 1,
    deck: riggedDeck("2c 3c 4c 2d 3d 4d 5h As Ks Qs 6h Js 7h Ts"),
  });
  hand = act(hand, "hero", "raise", 2);
  hand = act(hand, "nico", "call");
  hand = act(hand, "rune", "fold");
  hand = finish(hand);
  assert.equal(hand.result!.potCents, 5);
  assert.deepEqual(hand.result!.awards, { nico: 3, hero: 2 });
  assert.deepEqual(
    hand.players.map((player) => player.stackCents),
    [10, 11, 9],
  );
  assertHand(hand);
});

test("short big blind still sets nominal bring-in; lone active player cannot bet at all-ins", () => {
  let hand = startHand(players([100, 100, 5]), { random: random(9) });
  assert.equal(legalActions(hand, "hero").callCents, 20);
  hand = act(hand, "hero", "raise", 100);
  hand = act(hand, "nico", "call");
  assert.equal(hand.phase, "runout");
  assert.equal(hand.actorId, null);
  assert.equal(legalActions(hand, "hero").raise, false);
  hand = finish(hand);
  assertHand(hand);
  const short = startHand(players([5, 100]), { random: random(10) });
  assert.equal(short.phase, "runout");
  const result = finish(short);
  assert.equal(result.result!.potCents, 10);
  assertHand(result);
});

test("busted seats stay in order and button skips them between hands", () => {
  const complete = finish(
    startHand(players([100, 300, 500]), {
      deck: riggedDeck("Ks Qs As Kh Qh Ah 9c 2s 5d 8c Tc Jd 6h 3c"),
    }),
  );
  const inputs = complete.players.map((player, i) => ({
    ...player,
    stackCents:
      i === 1
        ? 0
        : i === 0
          ? player.stackCents + complete.players[1]!.stackCents
          : player.stackCents,
  }));
  const hand = startHand(inputs, { dealerIndex: 1, random: random(11) });
  assert.equal(hand.dealerIndex, 2);
  assert.deepEqual(
    hand.players.map((player) => player.id),
    ["hero", "nico", "rune"],
  );
  assert.equal(hand.players[1]!.status, "out");
  assert.equal(hand.players[1]!.holeCards.length, 0);
  assertHand(hand);
});

test("bots cannot use hidden opponents cards or undealt cards to make choices", () => {
  const hand = startHand(players([1000, 1000, 1000]), { random: random(12) });
  const hidden = {
    ...hand,
    deck: [...hand.deck].reverse(),
    players: hand.players.map((player) =>
      player.id === hand.actorId
        ? player
        : { ...player, holeCards: ["As", "Ah"] },
    ),
  };
  assert.deepEqual(
    chooseBotAction(hand, hand.actorId!, () => 0.31),
    chooseBotAction(hidden, hand.actorId!, () => 0.31),
  );
});

test("seeded sessions with 2–9 players terminate, conserve chips and keep all 52 cards", (t) => {
  let hands = 0,
    actions = 0;
  for (let count = 2; count <= 9; count++)
    for (let seed = 1; seed <= 10; seed++) {
      const rng = random(seed * 100 + count);
      let hand = startHand(practicePlayers(count, 400), { random: rng });
      for (let round = 0; round < 12; round++) {
        let steps = 0;
        while (hand.phase !== "complete") {
          assert.ok(++steps < 300, `${count} players seed ${seed}`);
          if (hand.phase === "runout") hand = advanceRunout(hand);
          else {
            const choice = chooseBotAction(hand, hand.actorId!, rng);
            hand = act(hand, hand.actorId!, choice.action, choice.amount);
            actions++;
          }
          assertHand(hand);
        }
        hands++;
        assert.equal(
          hand.result!.pots.reduce(
            (sum, pot) =>
              sum + Object.values(pot.shares).reduce((s, v) => s + v, 0),
            0,
          ),
          hand.result!.potCents,
        );
        if (hand.players.filter((player) => player.stackCents > 0).length < 2)
          break;
        hand = nextHand(hand, rng);
      }
    }
  assert.ok(hands >= 400);
  assert.ok(actions >= 3000);
  t.diagnostic(`${hands} complete hands and ${actions} legal actions checked.`);
});

test("folded contribution levels do not fabricate extra side pots", () => {
  assert.deepEqual(
    buildPots([
      { id: "a", committedCents: 800, status: "active" },
      { id: "b", committedCents: 800, status: "active" },
      { id: "c", committedCents: 800, status: "active" },
      { id: "d", committedCents: 80, status: "folded" },
      { id: "e", committedCents: 20, status: "folded" },
      { id: "f", committedCents: 20, status: "folded" },
    ]),
    [{ amountCents: 2520, eligibleIds: ["a", "b", "c"] }],
  );
});
