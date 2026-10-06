import AsyncStorage from "@react-native-async-storage/async-storage";
import { assertHand, Hand } from "./engine";
import { money } from "../money";

export type HistoryEntry = {
  number: number;
  summary: string;
  potCents: number;
  netCents: number;
  events: Hand["events"];
  result: NonNullable<Hand["result"]>;
  board: string[];
};
export type Session = {
  version: 2;
  hand: Hand;
  startingStackCents: number;
  handsPlayed: number;
  handsWon: number;
  history: HistoryEntry[];
};
const key = "felted.poker-session.v2";

export function newSession(hand: Hand): Session {
  return {
    version: 2,
    hand,
    startingStackCents:
      hand.players.find((player) => player.id === "hero")!.stackCents +
      hand.players.find((player) => player.id === "hero")!.committedCents,
    handsPlayed: 0,
    handsWon: 0,
    history: [],
  };
}
export function updateSession(session: Session, hand: Hand): Session {
  const next = { ...session, hand };
  if (
    !hand.result ||
    session.history.some((entry) => entry.number === hand.number)
  )
    return next;
  const stack = hand.players.find((player) => player.id === "hero")!.stackCents;
  const summary = hand.result.winnerIds
    .map(
      (id) =>
        `${hand.players.find((player) => player.id === id)!.name} wins ${money(hand.result!.awards[id]!)}`,
    )
    .join(" · ");
  return {
    ...next,
    handsPlayed: session.handsPlayed + 1,
    handsWon:
      session.handsWon + (hand.result.winnerIds.includes("hero") ? 1 : 0),
    history: [
      {
        number: hand.number,
        summary,
        potCents: hand.result.potCents,
        netCents: stack - session.startingStackCents,
        events: hand.events,
        result: hand.result,
        board: hand.board,
      },
      ...session.history,
    ].slice(0, 20),
  };
}
export async function loadSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Session;
  if (
    parsed.version !== 2 ||
    !parsed.hand ||
    !Array.isArray(parsed.history) ||
    parsed.history.length > 20 ||
    !Number.isSafeInteger(parsed.startingStackCents) ||
    !Number.isSafeInteger(parsed.handsPlayed) ||
    !Number.isSafeInteger(parsed.handsWon)
  )
    throw new Error("Saved table is unreadable.");
  assertHand(parsed.hand);
  if (
    !parsed.hand.players.some((player) => player.id === "hero") ||
    parsed.hand.players.length < 2 ||
    parsed.hand.players.length > 9 ||
    !["betting", "runout", "complete"].includes(parsed.hand.phase)
  )
    throw new Error("Saved table is invalid.");
  return parsed;
}
// Serialize writes so a slow write cannot overwrite a newer hand.
let writes: Promise<unknown> = Promise.resolve();
export function saveSession(session: Session) {
  const encoded = JSON.stringify(session);
  const pending = writes
    .catch(() => {})
    .then(() => AsyncStorage.setItem(key, encoded));
  writes = pending;
  return pending;
}
