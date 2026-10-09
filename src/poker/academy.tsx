import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, Icon, PlayingCard, useSheetScroll } from "../components";
import { Choice, Eyebrow, Panel, SectionHeading } from "../editorial";
import { Copy } from "../sheets";
import { Chip } from "../visuals";
import { C, F } from "../theme";

const rankings = [
  {
    name: "Straight flush",
    cards: ["9h", "Th", "Jh", "Qh", "Kh"],
    detail:
      "Five consecutive cards of one suit. The highest straight flush wins. A royal flush is ace-high.",
  },
  {
    name: "Four of a kind",
    cards: ["Qs", "Qh", "Qd", "Qc", "As"],
    detail:
      "Four cards of one rank. The four-card rank decides it, then the fifth card breaks a tie.",
  },
  {
    name: "Full house",
    cards: ["Ks", "Kh", "Kd", "5c", "5h"],
    detail:
      "Three of one rank and two of another. Compare the three-card rank first, then the pair.",
  },
  {
    name: "Flush",
    cards: ["Ah", "Jh", "8h", "6h", "2h"],
    detail:
      "Five of the same suit. Compare the highest cards in order; a suit never breaks a tie.",
  },
  {
    name: "Straight",
    cards: ["9h", "Ts", "Jd", "Qc", "Kh"],
    detail:
      "Five consecutive ranks. An ace can be high, or low in A–2–3–4–5. It cannot wrap around.",
  },
  {
    name: "Three of a kind",
    cards: ["Qs", "Qh", "Qd", "Ac", "9h"],
    detail:
      "Three of one rank. The remaining two cards are kickers, compared from highest to lowest.",
  },
  {
    name: "Two pair",
    cards: ["As", "Ah", "8d", "8c", "Kh"],
    detail:
      "Two different pairs. Compare the higher pair, then the lower pair, then the kicker.",
  },
  {
    name: "One pair",
    cards: ["Qs", "Qh", "Ad", "9c", "5h"],
    detail:
      "One pair with three kickers. Compare the pair first, then the kickers in descending order.",
  },
  {
    name: "High card",
    cards: ["As", "Jh", "9d", "6c", "3h"],
    detail:
      "When no other category applies, compare all five cards from highest to lowest.",
  },
];

export function LearnPoker({
  complete,
  onComplete,
}: {
  complete: boolean;
  onComplete: () => void;
}) {
  const [lesson, setLesson] = useState(0);
  const [rank, setRank] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const scrollTop = useSheetScroll();
  const selectLesson = (value: number) => {
    setLesson(value);
    requestAnimationFrame(scrollTop);
  };
  return (
    <>
      <Eyebrow>THE FELTED FIELD GUIDE</Eyebrow>
      <SectionHeading
        title="A little knowledge. A better hand."
        detail="Three short chapters. Take them at your own pace."
      />
      <View style={{ flexDirection: "row", gap: 6 }}>
        {["Basics", "Hand rankings", "Side pots"].map((label, i) => (
          <Choice
            key={label}
            label={label}
            selected={lesson === i}
            onPress={() => selectLesson(i)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      {lesson === 0 && (
        <>
          <Panel>
            <Eyebrow>01 · THE BIG IDEA</Eyebrow>
            <SectionHeading title="Two yours. Five shared." />
            <View
              style={{ flexDirection: "row", gap: 6, justifyContent: "center" }}
            >
              {["Qs", "Qh"].map((c) => (
                <PlayingCard key={c} code={c} width={44} />
              ))}
            </View>
            <Text
              style={{
                fontFamily: F.body,
                fontSize: 11,
                color: C.textSecondary,
                textAlign: "center",
              }}
            >
              Your two cards · an example hand
            </Text>
            <View
              style={{ flexDirection: "row", gap: 4, justifyContent: "center" }}
            >
              {["Qd", "9s", "5h", "2c", "As"].map((c) => (
                <PlayingCard key={c} code={c} width={38} />
              ))}
            </View>
            <Copy>
              Use either, both, or neither of your cards to make the best
              five-card hand. Here, three queens with ace and nine kickers make
              three of a kind.
            </Copy>
          </Panel>
          <SectionHeading title="The rhythm of a hand." />
          {[
            [
              "01",
              "Preflop",
              "Two private cards. Blinds start the action. The big blind has the option to raise.",
            ],
            [
              "02",
              "The flop",
              "Three shared cards. After the flop, action starts at the first active seat left of the dealer.",
            ],
            [
              "03",
              "Turn & river",
              "One more card on each street. Another round of betting after each.",
            ],
            [
              "04",
              "The reveal",
              "If more than one player remains, the best five cards win. Exact ties split the pot.",
            ],
          ].map(([n, title, detail]) => (
            <View key={n} style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#392548",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: C.accent, fontFamily: F.ui, fontSize: 11 }}
                >
                  {n}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: C.textPrimary,
                    fontFamily: F.ui,
                    fontSize: 14,
                  }}
                >
                  {title}
                </Text>
                <Copy>{detail}</Copy>
              </View>
            </View>
          ))}
          <Panel>
            <SectionHeading title="Your four choices." />
            <Copy>
              Check when nothing is owed. Call matches a bet. Raise is the total
              you commit on this street. Fold gives up your claim to the pots.
            </Copy>
            <Copy>
              Going all-in uses your remaining stack. A short all-in may not
              reopen raising for players who already acted.
            </Copy>
          </Panel>
          <Button
            label="Next: Hand rankings"
            primary
            onPress={() => selectLesson(1)}
          />
        </>
      )}
      {lesson === 1 && (
        <>
          <Panel>
            <Eyebrow>02 · STRONGEST TO SIMPLEST</Eyebrow>
            <SectionHeading title={rankings[rank]!.name} />
            <View
              style={{ flexDirection: "row", gap: 4, justifyContent: "center" }}
            >
              {rankings[rank]!.cards.map((card, i) => (
                <PlayingCard key={i} code={card} width={40} delay={i * 45} />
              ))}
            </View>
            <Copy>{rankings[rank]!.detail}</Copy>
          </Panel>
          <Text
            style={{ fontFamily: F.body, fontSize: 11, color: C.textSecondary }}
          >
            Tap a hand to see its cards and tie-break rules.
          </Text>
          <View style={{ gap: 3 }}>
            {rankings.map((r, i) => (
              <Pressable
                key={r.name}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${r.name}`}
                accessibilityState={{ selected: rank === i }}
                onPress={() => {
                  setRank(i);
                  requestAnimationFrame(scrollTop);
                }}
                style={({ pressed }) => ({
                  minHeight: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 12,
                  backgroundColor:
                    rank === i
                      ? "#392747"
                      : pressed
                        ? C.surfaceRaised
                        : "transparent",
                  borderRadius: 12,
                })}
              >
                <Text
                  style={{
                    fontFamily: F.regular,
                    fontSize: 11,
                    color: C.gold,
                    width: 18,
                  }}
                >
                  {i + 1}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: F.ui,
                    fontSize: 14,
                    color: rank === i ? C.accent : C.textPrimary,
                  }}
                >
                  {r.name}
                </Text>
                <Icon
                  name={rank === i ? "check" : "chevron"}
                  size={15}
                  color={C.textSecondary}
                />
              </Pressable>
            ))}
          </View>
          <Button
            label="Next: Side pots"
            primary
            onPress={() => selectLesson(2)}
          />
        </>
      )}
      {lesson === 2 && (
        <>
          <Panel>
            <Eyebrow>03 · A FAIR SHARE</Eyebrow>
            <SectionHeading title="Your chips set your ceiling." />
            <Copy>
              You go all-in for $10. Ava and Rune each put in $25. You have the
              best hand; Ava beats Rune.
            </Copy>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              {[
                ["You", "$10"],
                ["Ava", "$25"],
                ["Rune", "$25"],
              ].map(([name, amount]) => (
                <View key={name} style={{ alignItems: "center", gap: 6 }}>
                  <Chip size={28} gold={name === "You"} />
                  <Text
                    style={{
                      fontFamily: F.display,
                      color: C.textPrimary,
                      fontSize: 27,
                    }}
                  >
                    {amount}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.body,
                      color: C.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {name}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[
                ["Main pot", "$30", "You · Ava · Rune"],
                ["Side pot", "$30", "Ava · Rune"],
              ].map(([title, amount, names]) => (
                <View
                  key={title}
                  style={{
                    flex: 1,
                    padding: 12,
                    gap: 5,
                    backgroundColor: "#362242",
                    borderRadius: 14,
                  }}
                >
                  <Text
                    style={{ fontFamily: F.ui, fontSize: 12, color: C.accent }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.display,
                      fontSize: 28,
                      color: C.textPrimary,
                    }}
                  >
                    {amount}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.body,
                      fontSize: 10,
                      color: C.textSecondary,
                    }}
                  >
                    {names}
                  </Text>
                </View>
              ))}
            </View>
          </Panel>
          <SectionHeading
            title="How much can you win?"
            detail="One small side-pot practice · $60 total pot"
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[10, 30, 60].map((value) => (
              <Choice
                key={value}
                label={`$${value}`}
                selected={answer === value}
                onPress={() => setAnswer(value)}
                style={{ flex: 1 }}
              />
            ))}
          </View>
          {answer !== null && (
            <Panel>
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  fontFamily: F.body,
                  fontSize: 14,
                  lineHeight: 22,
                  color: answer === 30 ? C.positive : C.warning,
                }}
              >
                {answer === 30
                  ? "Exactly. Your $10 matches $10 from each opponent: a $30 main pot. Ava wins the $30 side pot."
                  : "Your contribution caps your winnings. Match your $10 with $10 from each opponent and try again."}
              </Text>
            </Panel>
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
          <Text
            style={{
              fontFamily: F.body,
              fontSize: 11,
              lineHeight: 18,
              color: C.textSecondary,
              textAlign: "center",
            }}
          >
            One small lesson. Your first collectible.
          </Text>
        </>
      )}
    </>
  );
}
