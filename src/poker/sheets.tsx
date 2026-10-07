import React, { useState } from "react";
import { Text, View } from "react-native";
import { Avatar, Button, Mono, PlayingCard, Surface } from "../components";
import { money } from "../game";
import { Copy } from "../sheets";
import { C } from "../theme";
import { buildPots, Hand, potTotal } from "./engine";
import { Session } from "./session";

export function GameSetup({
  onStart,
  replacing,
}: {
  onStart: (count: number, stack: number) => void;
  replacing: boolean;
}) {
  const [count, setCount] = useState(6),
    [stack, setStack] = useState(10000);
  return (
    <>
      <Copy>
        A quiet table. A real hand. Settle in with practice chips and automated
        opponents.
      </Copy>
      <Mono>Players, including you</Mono>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
          <Button
            key={n}
            label={`${n}`}
            small
            primary={count === n}
            onPress={() => setCount(n)}
            style={{ minWidth: 52, flexBasis: "22%", flexGrow: 1 }}
          />
        ))}
      </View>
      <Mono>Starting stack</Mono>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[2000, 10000].map((amount) => (
          <Button
            key={amount}
            label={money(amount)}
            primary={stack === amount}
            onPress={() => setStack(amount)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      <Surface>
        <Mono>Texas Hold’em · No limit</Mono>
        <Copy>$0.10 / $0.20 blinds · No rake</Copy>
        <Copy>Practice chips have no cash value.</Copy>
      </Surface>
      {replacing && (
        <Copy>
          Starting fresh replaces your saved table and its session history.
        </Copy>
      )}
      <Button
        label="Take a seat"
        primary
        onPress={() => onStart(count, stack)}
      />
    </>
  );
}

export function HandDetails({ hand }: { hand: Hand }) {
  const result = hand.result;
  const pots = result?.pots ?? buildPots(hand.players);
  const name = (id: string) =>
    hand.players.find((player) => player.id === id)!.name;
  return (
    <>
      <Mono>
        Hand #{hand.number} · {hand.street}
      </Mono>
      <Copy>
        {result
          ? result.reason === "showdown"
            ? "Best five cards win. Each side pot has its own eligible players."
            : "The last player in the hand takes the pot. Uncalled chips are returned."
          : "The pot includes every committed chip. Pot tiers are provisional until betting finishes. Opponent cards stay hidden until showdown."}
      </Copy>
      <View style={{ flexDirection: "row", gap: 5 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <PlayingCard key={i} code={hand.board[i]} width={42} />
        ))}
      </View>
      <Mono>
        {result ? "Awarded pot" : "Total pot"}{" "}
        {money(result?.potCents ?? potTotal(hand))}
      </Mono>
      {pots.map((pot, i) => (
        <Surface key={i} style={{ gap: 8 }}>
          <Mono>
            {i === 0 ? "Main pot" : `Side pot ${i}`} · {money(pot.amountCents)}
          </Mono>
          <Copy>
            {"winnerIds" in pot
              ? `Awarded to ${(pot as NonNullable<typeof result>["pots"][number]).winnerIds.map(name).join(" & ")}`
              : `Eligible: ${pot.eligibleIds.map(name).join(", ")}`}
          </Copy>
          {"shares" in pot &&
            Object.entries(
              (pot as NonNullable<typeof result>["pots"][number]).shares,
            ).map(([id, cents]) => (
              <Mono key={id} style={{ color: C.positive }}>
                {name(id)} · {money(cents)}
              </Mono>
            ))}
        </Surface>
      ))}
      {hand.players
        .filter((player) => player.holeCards.length > 0)
        .map((player) => {
          const reveal =
            player.id === "hero" ||
            (result?.reason === "showdown" && player.status !== "folded");
          return (
            <Surface
              key={player.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Avatar kind={player.avatar} size={42} />
              <View style={{ flex: 1, gap: 5 }}>
                <Mono>{player.name}</Mono>
                <Mono style={{ fontSize: 11, color: C.textSecondary }}>
                  {result?.hands[player.id]?.name ??
                    (player.status === "folded"
                      ? "Folded"
                      : player.status === "all-in"
                        ? "All-in"
                        : "In hand")}
                </Mono>
                <Mono style={{ fontSize: 11 }}>
                  {money(player.stackCents)} stack
                </Mono>
              </View>
              <View style={{ flexDirection: "row", gap: 3 }}>
                {player.holeCards.map((card, i) => (
                  <PlayingCard
                    key={i}
                    code={reveal ? card : undefined}
                    back={!reveal}
                    width={30}
                  />
                ))}
              </View>
            </Surface>
          );
        })}
      <Mono>Hand history</Mono>
      {hand.events.map((event) => (
        <View
          key={event.id}
          style={{
            borderLeftWidth: 1,
            borderColor: C.borderSubtle,
            paddingLeft: 12,
          }}
        >
          <Mono
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              color: C.textMuted,
            }}
          >
            {event.street}
          </Mono>
          <Copy>{event.text}</Copy>
        </View>
      ))}
    </>
  );
}

export function SessionDetails({ session }: { session: Session }) {
  const hero = session.hand.players.find((player) => player.id === "hero")!;
  const net =
    hero.stackCents + hero.committedCents - session.startingStackCents;
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <>
      <Copy>{session.hand.tableName} · practice session</Copy>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          ["Hands", session.handsPlayed],
          ["Won pots", session.handsWon],
          ["Net chips", `${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`],
        ].map(([label, value]) => (
          <Surface key={label} style={{ flex: 1, padding: 12, gap: 8 }}>
            <Mono style={{ fontSize: 10, color: C.textSecondary }}>
              {label}
            </Mono>
            <Mono style={{ fontSize: 17 }}>{value}</Mono>
          </Surface>
        ))}
      </View>
      <Copy>
        Your table saves after every action. The latest 20 completed hands are
        available here.
      </Copy>
      {!session.history.length && (
        <Surface>
          <Mono>The story starts with one hand.</Mono>
          <Copy>Completed hands will appear here.</Copy>
        </Surface>
      )}
      {session.history.map((entry) => (
        <Surface key={entry.number} style={{ gap: 10 }}>
          <Mono>
            Hand #{entry.number} · {money(entry.potCents)} pot
          </Mono>
          <Copy>{entry.summary}</Copy>
          <Button
            label={`${expanded === entry.number ? "Hide" : "Review"} hand #${entry.number}`}
            small
            onPress={() =>
              setExpanded(expanded === entry.number ? null : entry.number)
            }
          />
          {expanded === entry.number && (
            <>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {entry.board.map((code, i) => (
                  <PlayingCard key={i} code={code} width={32} />
                ))}
              </View>
              {entry.events.map((event) => (
                <Copy key={event.id}>{event.text}</Copy>
              ))}
            </>
          )}
        </Surface>
      ))}
    </>
  );
}

export function LearnPoker({
  complete,
  onComplete,
}: {
  complete: boolean;
  onComplete: () => void;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <>
      <Copy>
        Two cards are yours. Five are shared. Make your best five-card hand
        using either, both, or neither of your cards.
      </Copy>
      {[
        [
          "The rhythm",
          "Post blinds, play preflop, then the flop (three cards), turn (one), and river (one). The dealer acts last after the flop.",
        ],
        [
          "Your choices",
          "Check when nothing is owed. Call matches a bet. Raise is the total you commit on this street. Fold gives up your claim to every pot.",
        ],
        [
          "Going all-in",
          "You can call with your remaining stack. A short all-in may not reopen raises. You can only win chips matched by your contribution.",
        ],
        [
          "At showdown",
          "Straight flush, four of a kind, full house, flush, straight, trips, two pair, pair, high card. Tied hands split the pot; kickers break most ties.",
        ],
      ].map(([title, text]) => (
        <Surface key={title} style={{ gap: 8 }}>
          <Mono style={{ color: C.accent }}>{title}</Mono>
          <Copy>{text}</Copy>
        </Surface>
      ))}
      <Mono>One small side-pot practice</Mono>
      <Copy>
        You go all-in for $10. Ava and Rune each put in $25. You have the best
        hand; Ava beats Rune. How much of the $60 pot can you win?
      </Copy>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[10, 30, 60].map((value) => (
          <Button
            key={value}
            label={`$${value}`}
            primary={answer === value}
            onPress={() => setAnswer(value)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      {answer !== null && (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: answer === 30 ? C.positive : C.warning,
            lineHeight: 22,
          }}
        >
          {answer === 30
            ? "Exactly. Your $10 matches $10 from each opponent: a $30 main pot. Ava wins the $30 side pot."
            : "Your contribution caps your winnings. Match your $10 with $10 from each opponent and try again."}
        </Text>
      )}
      <Button
        label={
          complete
            ? "Return to The Reader"
            : "Complete practice & unlock The Reader"
        }
        primary
        disabled={answer !== 30 && !complete}
        onPress={onComplete}
      />
    </>
  );
}
