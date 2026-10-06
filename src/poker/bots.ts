import { evaluate, Random, rankOf } from "./cards";
import { Hand, legalActions, PokerAction, potTotal } from "./engine";

/** Uses this seat's cards and public board/betting only; never reads other hands or the deck. */
export function chooseBotAction(
  hand: Hand,
  id: string,
  random: Random = Math.random,
): { action: PokerAction; amount?: number } {
  const player = hand.players.find((seat) => seat.id === id);
  const options = legalActions(hand, id);
  if (!player || !options.active)
    throw new Error("Bot is not the acting player.");
  const ranks = player.holeCards.map(rankOf).sort((a, b) => b - a);
  let strength =
    ranks[0] === ranks[1]
      ? 0.55 + ranks[0]! / 35
      : (ranks[0]! + ranks[1]!) / 45 +
        (player.holeCards[0]![1] === player.holeCards[1]![1] ? 0.08 : 0);
  if (hand.board.length >= 3) {
    const value = evaluate([...player.holeCards, ...hand.board]);
    strength = [0.18, 0.43, 0.66, 0.78, 0.86, 0.9, 0.95, 0.98, 1][
      value.category
    ]!;
    if (value.category === 0) strength += (ranks[0]! - 2) / 110;
    if (value.category === 1) strength += value.kickers[0]! / 100;
    if (hand.board.length < 5) {
      const suits = [...player.holeCards, ...hand.board].map((card) => card[1]);
      if (
        ["s", "h", "d", "c"].some(
          (suit) => suits.filter((value) => value === suit).length === 4,
        )
      )
        strength += 0.13;
    }
  }
  const roll = random(),
    price = options.callCents / Math.max(1, potTotal(hand) + options.callCents);
  if (
    options.call &&
    roll > 0.07 &&
    strength < 0.37 + price * 0.55 &&
    options.owed > hand.bigBlindCents * 2
  )
    return { action: "fold" };
  if (
    options.raise &&
    ((strength > 0.74 && roll < 0.55) ||
      (options.check && strength > 0.43 && roll < 0.28) ||
      roll < 0.035)
  ) {
    const desired =
      hand.currentBetCents === 0
        ? Math.max(
            hand.bigBlindCents,
            Math.round((potTotal(hand) * 0.55) / hand.bigBlindCents) *
              hand.bigBlindCents,
          )
        : hand.currentBetCents +
          Math.max(hand.lastFullRaiseCents, hand.bigBlindCents * 2);
    return {
      action: hand.currentBetCents ? "raise" : "bet",
      amount: Math.max(options.minimum, Math.min(options.maximum, desired)),
    };
  }
  return { action: options.check ? "check" : "call" };
}
