import React, { useState } from "react";
import { Text, View } from "react-native";
import { Avatar, Button, Mono, PlayingCard, Surface } from "../components";
import { money } from "../game";
import { Copy } from "../sheets";
import { C, F } from "../theme";
import { Choice, Eyebrow, Metric, Panel, SectionHeading } from "../editorial";
import { TablePreview } from "../setup-preview";
import { buildPots, Hand, potTotal } from "./engine";
import { Session } from "./session";
import { SessionChart } from "./session-chart";

export function GameSetup({
  onStart,
  replacing,
  avatar,
}: {
  onStart: (count: number, stack: number) => void;
  replacing: boolean;
  avatar?: string;
}) {
  const [count, setCount] = useState(6),
    [stack, setStack] = useState(10000);
  return (
    <>
      <View style={{ gap: 4 }}>
        <Eyebrow>YOUR GAME. YOUR PACE.</Eyebrow>
        <SectionHeading
          title={
            count === 2
              ? "Just the two of you."
              : count >= 8
                ? "A full house of personalities."
                : "Room for a good hand."
          }
          detail={
            count === 2
              ? "More decisions. One opponent. Find your rhythm heads-up."
              : "A proper Hold’em table, with automated opponents and practice chips."
          }
        />
      </View>
      <TablePreview count={count} avatar={avatar} />
      <SectionHeading
        title="Who’s at the table?"
        detail="Players, including you"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
          <Choice
            key={n}
            label={`${n}`}
            selected={count === n}
            onPress={() => setCount(n)}
            style={{ minWidth: 52, flexBasis: "22%", flexGrow: 1 }}
          />
        ))}
      </View>
      <SectionHeading
        title="Start with a little, or a lot."
        detail="Starting stack · $0.10 / $0.20 blinds"
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[2000, 10000].map((amount) => (
          <Choice
            key={amount}
            label={money(amount)}
            detail={amount === 2000 ? "100 big blinds" : "500 big blinds"}
            selected={stack === amount}
            onPress={() => setStack(amount)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      <Text
        style={{
          fontFamily: F.body,
          color: C.textSecondary,
          fontSize: 11,
          lineHeight: 18,
        }}
      >
        No-limit Texas Hold’em · No rake. Practice chips have no cash value.
        Your table saves after every action.
      </Text>
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
  const best = result?.hands.hero;
  return (
    <>
      <Panel>
        <Eyebrow>
          HAND #{hand.number} · {result ? "THE RESULT" : "IN PROGRESS"}
        </Eyebrow>
        <SectionHeading
          title={
            result
              ? result.winnerIds.includes("hero")
                ? "A little moment to savor."
                : "Every hand has a story."
              : "The story so far."
          }
        />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Metric
            label={result ? "Awarded pot" : "Total pot"}
            value={money(result?.potCents ?? potTotal(hand))}
          />
          {result && (
            <Metric
              label="Your winnings"
              value={money(result.awards.hero ?? 0)}
              positive={!!result.awards.hero}
            />
          )}
        </View>
      </Panel>
      <Copy>
        {result
          ? result.reason === "showdown"
            ? "Best five cards win. Each side pot has its own eligible players."
            : "The last player in the hand takes the pot. Uncalled chips are returned."
          : "The pot includes every committed chip. Pot tiers are provisional until betting finishes. Opponent cards stay hidden until showdown."}
      </Copy>
      <Eyebrow>THE SHARED CARDS</Eyebrow>
      <View style={{ flexDirection: "row", gap: 5, justifyContent: "center" }}>
        {Array.from({ length: 5 }, (_, i) => (
          <PlayingCard key={i} code={hand.board[i]} width={42} />
        ))}
      </View>
      {best && (
        <Panel>
          <Eyebrow>YOUR BEST FIVE</Eyebrow>
          <SectionHeading title={best.name} />
          <View
            style={{ flexDirection: "row", gap: 4, justifyContent: "center" }}
          >
            {best.cards.map((card, i) => (
              <PlayingCard
                key={i}
                code={card}
                width={40}
                highlighted={!!result?.awards.hero}
              />
            ))}
          </View>
          <Copy>
            The engine selects the strongest five-card combination from your
            cards and the board.
          </Copy>
        </Panel>
      )}
      <SectionHeading
        title="Where the chips went."
        detail={
          result
            ? "Each pot has its own eligible winners."
            : "Provisional pots while betting continues."
        }
      />
      {pots.map((pot, i) => (
        <Surface key={i} style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: F.display,
              fontSize: 25,
              color: C.textPrimary,
            }}
          >
            {i === 0 ? "Main pot" : `Side pot ${i}`} · {money(pot.amountCents)}
          </Text>
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
                <Text
                  style={{
                    fontFamily: F.ui,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}
                >
                  {player.name}
                </Text>
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
      <SectionHeading
        title="Hand history"
        detail="Every decision, grouped by street."
      />
      <EventTimeline events={hand.events} />
    </>
  );
}

function EventTimeline({ events }: { events: Hand["events"] }) {
  return (
    <View style={{ gap: 14 }}>
      {["preflop", "flop", "turn", "river", "showdown"].map((street) => {
        const group = events.filter((event) => event.street === street);
        if (!group.length) return null;
        return (
          <View
            key={street}
            style={{
              paddingLeft: 18,
              borderLeftWidth: 1,
              borderColor: "#72548D",
              gap: 8,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 5,
                left: -4,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: C.gold,
              }}
            />
            <Text
              style={{ fontFamily: F.display, fontSize: 24, color: C.accent }}
            >
              {street === "preflop"
                ? "Preflop"
                : street === "showdown"
                  ? "The reveal"
                  : `The ${street}`}
            </Text>
            {group.map((event) => (
              <Copy key={event.id}>{event.text}</Copy>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export function SessionDetails({
  session,
  initialHandNumber = null,
}: {
  session: Session;
  initialHandNumber?: number | null;
}) {
  const hero = session.hand.players.find((player) => player.id === "hero")!;
  const net =
    hero.stackCents + hero.committedCents - session.startingStackCents;
  const [expanded, setExpanded] = useState<number | null>(initialHandNumber);
  const [focused, setFocused] = useState<number | null>(initialHandNumber);
  const entries =
    focused === null
      ? session.history
      : session.history.filter((entry) => entry.number === focused);
  return (
    <>
      <Panel>
        <Eyebrow>YOUR TIME AT THE TABLE</Eyebrow>
        <SectionHeading
          title={session.hand.tableName}
          detail="Practice session · saved on this device"
        />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Metric label="Hands" value={session.handsPlayed} />
          <Metric label="Won pots" value={session.handsWon} />
          <Metric
            label="Net chips"
            value={`${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`}
            positive={net > 0}
          />
        </View>
        {session.history.length > 0 && <SessionChart session={session} />}
      </Panel>
      <Copy>
        Your table saves after every action. The latest 20 completed hands are
        available here.
      </Copy>
      {!session.history.length && (
        <Surface>
          <SectionHeading title="The story starts with one hand." />
          <Copy>Completed hands will appear here.</Copy>
        </Surface>
      )}
      {session.history.length > 0 && (
        <SectionHeading
          title="One hand at a time."
          detail="Tap a hand to revisit the board and every decision."
        />
      )}
      {focused !== null && (
        <Button
          label="All saved hands"
          small
          onPress={() => {
            setFocused(null);
            setExpanded(null);
          }}
        />
      )}
      {entries.map((entry) => (
        <Panel key={entry.number} style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: F.display,
                fontSize: 27,
                color: C.textPrimary,
              }}
            >
              Hand #{entry.number}
            </Text>
            <Eyebrow>{money(entry.potCents)} POT</Eyebrow>
          </View>
          <Copy>{entry.summary}</Copy>
          <Button
            label={`${expanded === entry.number ? "Hide" : "Review"} hand #${entry.number}`}
            small
            onPress={() => {
              setExpanded(expanded === entry.number ? null : entry.number);
              if (expanded === entry.number) setFocused(null);
            }}
          />
          {expanded === entry.number && (
            <>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {entry.board.map((code, i) => (
                  <PlayingCard key={i} code={code} width={32} />
                ))}
              </View>
              {entry.result.hands.hero && (
                <>
                  <Eyebrow>
                    YOUR BEST FIVE · {entry.result.hands.hero.name}
                  </Eyebrow>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {entry.result.hands.hero.cards.map((code, i) => (
                      <PlayingCard key={i} code={code} width={34} />
                    ))}
                  </View>
                </>
              )}
              <EventTimeline events={entry.events} />
            </>
          )}
        </Panel>
      ))}
    </>
  );
}

export { LearnPoker } from "./academy";
