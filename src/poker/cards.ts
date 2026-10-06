export type Card = string;
export type Random = () => number;
export type HandValue = {
  category: number;
  kickers: number[];
  name: string;
  cards: Card[];
};
const ranks = "23456789TJQKA";
const names = [
  "High card",
  "One pair",
  "Two pair",
  "Three of a kind",
  "Straight",
  "Flush",
  "Full house",
  "Four of a kind",
  "Straight flush",
];

export function rankOf(card: Card) {
  return ranks.indexOf(card[0]!) + 2;
}
export function validCard(card: unknown): card is Card {
  return typeof card === "string" && /^[2-9TJQKA][shdc]$/.test(card);
}
export function deck(random: Random = Math.random): Card[] {
  const cards = [...ranks].flatMap((rank) =>
    [..."shdc"].map((suit) => rank + suit),
  );
  for (let i = cards.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
      throw new Error(
        "Random source must return a value from 0 to less than 1.",
      );
    const j = Math.floor(value * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function five(cards: Card[]): HandValue {
  const sorted = cards.map(rankOf).sort((a, b) => b - a);
  const counts = new Map<number, number>();
  for (const rank of sorted) counts.set(rank, (counts.get(rank) ?? 0) + 1);
  const groups = [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const unique = [...new Set(sorted)];
  const flush = cards.every((card) => card[1] === cards[0]![1]);
  const straight =
    unique.length === 5 && unique[0]! - unique[4]! === 4
      ? unique[0]!
      : unique.join(",") === "14,5,4,3,2"
        ? 5
        : 0;
  let category = 0,
    kickers = sorted;
  if (flush && straight) {
    category = 8;
    kickers = [straight];
  } else if (groups[0]![1] === 4) {
    category = 7;
    kickers = groups.map((g) => g[0]);
  } else if (groups[0]![1] === 3 && groups[1]![1] === 2) {
    category = 6;
    kickers = groups.map((g) => g[0]);
  } else if (flush) category = 5;
  else if (straight) {
    category = 4;
    kickers = [straight];
  } else if (groups[0]![1] === 3) {
    category = 3;
    kickers = groups.map((g) => g[0]);
  } else if (groups[0]![1] === 2 && groups[1]![1] === 2) {
    category = 2;
    kickers = groups.map((g) => g[0]);
  } else if (groups[0]![1] === 2) {
    category = 1;
    kickers = groups.map((g) => g[0]);
  }
  return {
    category,
    kickers,
    name: category === 8 && straight === 14 ? "Royal flush" : names[category]!,
    cards: [...cards],
  };
}

export function compareHands(a: HandValue, b: HandValue): number {
  if (a.category !== b.category) return a.category - b.category;
  for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
    const difference = (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

/** Select the best five of five, six or seven cards, including playing the board. */
export function evaluate(cards: Card[]): HandValue {
  if (
    cards.length < 5 ||
    cards.length > 7 ||
    cards.some((card) => !validCard(card)) ||
    new Set(cards).size !== cards.length
  )
    throw new Error("Evaluate five to seven distinct, valid cards.");
  let best: HandValue | undefined;
  for (let a = 0; a < cards.length - 4; a++)
    for (let b = a + 1; b < cards.length - 3; b++)
      for (let c = b + 1; c < cards.length - 2; c++)
        for (let d = c + 1; d < cards.length - 1; d++)
          for (let e = d + 1; e < cards.length; e++) {
            const value = five([
              cards[a]!,
              cards[b]!,
              cards[c]!,
              cards[d]!,
              cards[e]!,
            ]);
            if (!best || compareHands(value, best) > 0) best = value;
          }
  return best!;
}

export function holeLabel(cards: Card[], board: Card[]): string {
  if (cards.length !== 2) return "Waiting for deal";
  if (board.length >= 3) return evaluate([...cards, ...board]).name;
  const high = cards.map(rankOf).sort((a, b) => b - a);
  const plural: Record<number, string> = {
    14: "aces",
    13: "kings",
    12: "queens",
    11: "jacks",
    10: "tens",
    9: "nines",
    8: "eights",
    7: "sevens",
    6: "sixes",
    5: "fives",
    4: "fours",
    3: "threes",
    2: "twos",
  };
  return high[0] === high[1]
    ? `Pocket ${plural[high[0]!]}`
    : cards[0]![1] === cards[1]![1]
      ? "Suited"
      : "Offsuit";
}
