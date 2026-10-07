import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Avatar,
  Button,
  Collectible,
  Header,
  Icon,
  Mono,
  PlayingCard,
  Surface,
  TimerArc,
} from "./components";
import { compactMoney, DEMO_TURN_SECONDS, money, Seat } from "./game";
import { arenaLayout } from "./layout";
import { C, F } from "./theme";
import { Entrance, Pulse } from "./motion";
import { Anchor } from "./player-card";
import {
  Atmosphere,
  Chip,
  FeltSurface,
  PayoutFlight,
  StreetMoment,
  VictorySpark,
  WagerFlight,
} from "./visuals";

export function AvatarSeat({
  seat,
  size,
  onPress,
  simple,
  acting = false,
  dealKey,
}: {
  seat: Seat;
  size: number;
  onPress: (anchor: Anchor) => void;
  simple?: boolean;
  acting?: boolean;
  dealKey?: number;
}) {
  const folded = seat.status === "folded";
  const target = useRef<View>(null);
  return (
    <Pressable
      ref={target}
      testID={`seat-${seat.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${seat.name}, ${seat.status ?? "active"}, stack ${money(seat.stackCents)}, ${seat.positionLabel ?? ""}${seat.displayAction ?? seat.lastAction ?? ""}. Player details`}
      onPress={() =>
        target.current?.measureInWindow((x, y, width, height) =>
          onPress({ x, y, width, height }),
        )
      }
      style={s.seat}
    >
      {seat.status === "empty" ? (
        <>
          <View style={[s.invite, { width: size, height: size }]}>
            <Icon name="plus" size={24} />
          </View>
          <Mono style={s.seatName}>Invite</Mono>
        </>
      ) : (
        <>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: acting || seat.winner ? 2 : 1,
              borderColor: acting
                ? C.accent
                : seat.winner
                  ? C.positive
                  : C.borderStrong,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#261C32",
              shadowColor: acting ? C.accent : seat.winner ? C.gold : "#000",
              shadowOpacity: acting || seat.winner ? 0.3 : 0,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            {(acting || seat.winner) && (
              <Pulse
                style={{
                  position: "absolute",
                  inset: -5,
                  borderRadius: size,
                  borderWidth: 1,
                  borderColor: seat.winner ? C.gold : C.accent,
                }}
              >
                <View />
              </Pulse>
            )}
            {!seat.revealed &&
              seat.status !== "out" &&
              seat.status !== "empty" && (
                <View
                  pointerEvents="none"
                  accessible={false}
                  style={{
                    position: "absolute",
                    right: -7,
                    top: -5,
                    opacity: folded ? 0.15 : 0.8,
                  }}
                >
                  <Entrance
                    identity={dealKey}
                    delay={80}
                    distance={18}
                    duration={420}
                  >
                    <View
                      style={{
                        width: 15,
                        height: 21,
                        borderRadius: 3,
                        backgroundColor: "#513564",
                        borderWidth: 1,
                        borderColor: "#A58BBB",
                        transform: [{ rotate: "18deg" }],
                      }}
                    />
                  </Entrance>
                  <View style={{ position: "absolute", left: -7, top: 0 }}>
                    <Entrance identity={dealKey} distance={18} duration={420}>
                      <View
                        style={{
                          width: 15,
                          height: 21,
                          borderRadius: 3,
                          backgroundColor: "#412A54",
                          borderWidth: 1,
                          borderColor: "#A58BBB",
                          transform: [{ rotate: "-8deg" }],
                        }}
                      />
                    </Entrance>
                  </View>
                </View>
              )}
            <Avatar kind={seat.avatar} size={size - 3} dim={folded} />
            {seat.positionLabel && (
              <View style={s.blind}>
                <Mono style={{ fontSize: 8, color: C.textSecondary }}>
                  {seat.positionLabel}
                </Mono>
              </View>
            )}
            {seat.revealed && seat.holeCards && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  left: -12,
                  flexDirection: "row",
                  gap: 2,
                }}
              >
                {seat.holeCards.map((code, i) => (
                  <PlayingCard key={i} code={code} width={20} />
                ))}
              </View>
            )}
          </View>
          {!simple && (
            <>
              <Mono
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={[
                  s.seatName,
                  {
                    fontFamily: F.ui,
                    color: folded ? C.textMuted : C.textPrimary,
                  },
                ]}
              >
                {seat.name}
              </Mono>
              <Mono
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={s.stack}
              >
                {compactMoney(seat.stackCents).slice(1)}
              </Mono>
              <Mono
                numberOfLines={1}
                maxFontSizeMultiplier={1.1}
                style={[
                  s.status,
                  {
                    color: acting
                      ? C.accent
                      : folded
                        ? C.textSecondary
                        : ["raise", "bet", "Raise"].includes(
                              seat.displayAction ?? seat.lastAction ?? "",
                            )
                          ? C.warning
                          : C.positive,
                  },
                ]}
              >
                {acting
                  ? "Thinking…"
                  : seat.winner
                    ? "Won pot"
                    : seat.status === "out"
                      ? "Sitting out"
                      : folded
                        ? "Folded"
                        : `${seat.displayAction ?? seat.lastAction ?? ""}${seat.displayContributionCents ? ` ${money(seat.displayContributionCents).slice(1)}` : ""}`}
              </Mono>
            </>
          )}
        </>
      )}
    </Pressable>
  );
}

export function HeroDock({
  hero,
  equipped,
  remaining,
  active,
  onProfile,
  compact,
  awaitingDeal = false,
  handLabel = "Three of a kind",
  dealKey,
}: {
  hero: Seat;
  equipped: boolean;
  remaining: number;
  active: boolean;
  onProfile: (anchor: Anchor) => void;
  compact: boolean;
  awaitingDeal?: boolean;
  handLabel?: string;
  dealKey?: string | number;
}) {
  const target = useRef<View>(null);
  return (
    <Surface
      style={{
        padding: 12,
        minHeight: compact ? 88 : 98,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#21172C",
        borderColor: hero.winner ? C.gold : active ? "#83639D" : "#473353",
      }}
    >
      <Pressable
        ref={target}
        accessibilityRole="button"
        accessibilityLabel={`Your profile, stack ${money(hero.stackCents)}${equipped ? ", The Reader equipped" : ""}`}
        onPress={() =>
          target.current?.measureInWindow((x, y, width, height) =>
            onProfile({ x, y, width, height }),
          )
        }
        style={{ width: 56, height: 56 }}
      >
        <Avatar size={56} />
        {active && (
          <TimerArc size={62} remaining={remaining} total={DEMO_TURN_SECONDS} />
        )}
        {equipped && (
          <View style={{ position: "absolute", bottom: -4, right: -4 }}>
            <Collectible size={20} />
          </View>
        )}
      </Pressable>
      <View style={{ flex: 1, gap: 5 }}>
        <Mono style={{ fontSize: 12, fontFamily: F.ui }}>
          {hero.status === "folded"
            ? "You · folded"
            : `You${hero.positionLabel ? ` · ${hero.positionLabel}` : ""}`}
        </Mono>
        <Mono numberOfLines={1} style={{ fontSize: 16, color: C.textPrimary }}>
          {compactMoney(hero.stackCents).slice(1)}
        </Mono>
      </View>
      <View style={{ alignItems: "center", gap: 7 }}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {(hero.holeCards ?? ["8h", "8c"]).map((code, i) => (
            <PlayingCard
              key={i}
              code={awaitingDeal ? undefined : code}
              width={compact ? 43 : 48}
              rotation={awaitingDeal ? 0 : i ? 6 : -6}
              delay={i * 90}
              emptyLabel="Hole card not dealt"
              highlighted={hero.winner}
              dealKey={dealKey}
            />
          ))}
        </View>
        <Mono
          style={{
            fontSize: 10,
            fontFamily: F.ui,
            color: hero.winner ? C.positive : C.textSecondary,
          }}
        >
          {awaitingDeal ? "Waiting for deal" : handLabel}
        </Mono>
      </View>
    </Surface>
  );
}

export function TableScreen({
  seats,
  hero,
  potCents,
  board,
  equipped,
  remaining,
  active,
  pending,
  message,
  callLabel,
  raiseLabel,
  canRaise,
  canAct,
  muted,
  reaction,
  simple,
  host,
  onMenu,
  onChat,
  onSeat,
  onInfo,
  onFold,
  onCall,
  onRaise,
  actorId,
  handLabel,
  handNumber,
  street,
  complete = false,
  canContinue = true,
  onNext,
  paused = false,
  onResume,
  raiseControl,
  tableName = "The Night Shift",
  lastEvent,
  heroAwardCents,
}: {
  seats: Seat[];
  hero: Seat;
  potCents: number;
  board: string[];
  equipped: boolean;
  remaining: number;
  active: boolean;
  pending: boolean;
  message: string;
  callLabel: string;
  raiseLabel?: "Bet" | "Raise";
  canRaise: boolean;
  canAct: boolean;
  muted: boolean;
  reaction: string | null;
  simple: boolean;
  host: boolean;
  onMenu: () => void;
  onChat: () => void;
  onSeat: (seat: Seat, anchor?: Anchor) => void;
  onInfo: () => void;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
  actorId?: string | null;
  handLabel?: string;
  handNumber?: number;
  street?: string;
  complete?: boolean;
  canContinue?: boolean;
  onNext?: () => void;
  paused?: boolean;
  onResume?: () => void;
  raiseControl?: React.ReactNode;
  tableName?: string;
  lastEvent?: string;
  heroAwardCents?: number;
}) {
  const { height } = useWindowDimensions();
  const compact = height < 740;
  const [arena, setArena] = useState({ width: 351, height: 400 });
  const fullLayout = arenaLayout(arena.width, arena.height, seats.length);
  const condensed = arena.height < 270;
  const layout = condensed
    ? {
        ...fullLayout,
        cardWidth: 34,
        board: {
          x: (arena.width - 186) / 2,
          y: Math.max(0, (arena.height - 134) / 2),
          width: 186,
          height: 134,
        },
      }
    : fullLayout;
  const actorIndex = seats.findIndex((seat) => seat.id === actorId);
  const actorPosition =
    actorIndex >= 0
      ? layout.seats[actorIndex]!
      : {
          x: arena.width / 2 - 12,
          y: arena.height - 12,
          width: 24,
          height: 24,
        };
  const winnerTargets = seats.flatMap((seat, index) =>
    seat.winner ? [{ id: seat.id, ...layout.seats[index]! }] : [],
  );
  if (hero.winner)
    winnerTargets.push({
      id: "hero",
      x: arena.width / 2 - 12,
      y: arena.height - 12,
      width: 24,
      height: 24,
    });
  return (
    <View style={{ flex: 1 }}>
      <Atmosphere />
      <Header onLeft={onMenu} onChat={onChat} subtitle={tableName} />
      <View
        testID="arena"
        onLayout={(e) => setArena(e.nativeEvent.layout)}
        style={s.arena}
      >
        <FeltSurface
          width={arena.width}
          height={arena.height}
          complete={complete}
        />
        {!condensed &&
          seats.map((seat, i) => (
            <View
              key={seat.id}
              style={{
                position: "absolute",
                left: layout.seats[i]!.x,
                top: layout.seats[i]!.y,
                width: layout.seats[i]!.width,
                height: layout.seats[i]!.height,
              }}
            >
              <AvatarSeat
                seat={seat}
                size={layout.avatarSize}
                onPress={(anchor) => onSeat(seat, anchor)}
                simple={simple}
                acting={actorId === seat.id && !paused}
                dealKey={handNumber}
              />
            </View>
          ))}
        <View
          testID="board-stage"
          style={{
            position: "absolute",
            left: layout.board.x,
            top: layout.board.y,
            width: layout.board.width,
            height: layout.board.height,
            alignItems: "center",
            gap: condensed ? 4 : 8,
            paddingTop: 3,
            borderRadius: 22,
            backgroundColor: "transparent",
          }}
        >
          {!condensed && layout.board.y > layout.avatarSize + 69 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -26,
                left: layout.board.width / 2 - 21,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Chip size={22} gold />
              <View style={{ marginLeft: -6, marginTop: -5 }}>
                <Chip size={24} />
              </View>
              <View style={{ marginLeft: -8, marginTop: 2 }}>
                <Chip size={21} gold />
              </View>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${complete ? "Awarded" : "Total"} pot ${money(potCents)}. Hand details`}
            onPress={onInfo}
            style={{
              minHeight: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Mono
              style={{
                fontSize: 9,
                color: C.textSecondary,
                letterSpacing: 1.6,
              }}
            >
              {complete
                ? hero.winner
                  ? "YOUR WINNINGS"
                  : "POT AWARDED"
                : "TOTAL POT"}
            </Mono>
            <Entrance identity={potCents} distance={4} duration={230}>
              <Mono
                testID="pot"
                style={{
                  fontFamily: F.display,
                  fontSize: condensed ? 30 : layout.cardWidth > 44 ? 45 : 38,
                  lineHeight: condensed ? 33 : layout.cardWidth > 44 ? 48 : 42,
                  color: complete && hero.winner ? C.gold : C.textPrimary,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {compactMoney(
                  complete && hero.winner
                    ? (heroAwardCents ?? potCents)
                    : potCents,
                )}
              </Mono>
            </Entrance>
          </Pressable>
          <View testID="board-cards" style={{ flexDirection: "row", gap: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <PlayingCard
                key={i}
                code={board[i]}
                width={layout.cardWidth}
                delay={i < 3 ? i * 100 : 0}
                dealKey={handNumber}
                highlighted={complete && hero.winner}
              />
            ))}
          </View>
          <View style={{ alignItems: "center", gap: 5 }}>
            <View
              style={{ flexDirection: "row", gap: 7, alignItems: "center" }}
            >
              {["preflop", "flop", "turn", "river"].map((stage, i) => (
                <View
                  key={stage}
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <View
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor:
                        board.length >= [0, 3, 4, 5][i]! ? C.accent : "#655075",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: F.ui,
                      fontSize: 7,
                      letterSpacing: 0.5,
                      color: street === stage ? C.textPrimary : C.textMuted,
                    }}
                  >
                    {["PRE", "FLOP", "TURN", "RIVER"][i]}
                  </Text>
                </View>
              ))}
            </View>
            {!condensed && (
              <Mono style={{ color: C.textSecondary, fontSize: 9 }}>
                {complete && hero.winner
                  ? `From ${compactMoney(potCents)} total pot`
                  : "$0.10 / $0.20 · NLH"}
              </Mono>
            )}
            {handNumber && (
              <Mono
                testID="hand-street"
                style={{
                  color: C.accent,
                  fontSize: 9,
                  textTransform: "uppercase",
                }}
              >
                #{handNumber} · {street}
              </Mono>
            )}
          </View>
          {host && (
            <Mono style={{ fontSize: 10, color: C.textSecondary }}>
              Waiting for friends
            </Mono>
          )}
        </View>
        {!condensed && (
          <WagerFlight
            pot={potCents}
            hand={handNumber}
            actor={actorId}
            start={{
              x: actorPosition.x + actorPosition.width / 2 - 11,
              y: actorPosition.y + 30,
            }}
            end={{ x: arena.width / 2 - 11, y: layout.board.y + 35 }}
          />
        )}
        {!condensed &&
          winnerTargets.map((winner) => (
            <PayoutFlight
              key={winner.id}
              complete={complete}
              hand={handNumber}
              start={{ x: arena.width / 2 - 13, y: layout.board.y + 35 }}
              end={{
                x: winner.x + winner.width / 2 - 13,
                y: winner.y + 25,
              }}
            />
          ))}
        {complete && hero.winner && (
          <VictorySpark identity={`win-${handNumber}`} />
        )}
        {!simple && !condensed && (
          <StreetMoment street={street} hand={handNumber} />
        )}
        {simple && (
          <View
            style={{ position: "absolute", bottom: 4, left: 80, right: 80 }}
          >
            <Button label="Players and stacks" small onPress={onInfo} />
          </View>
        )}
        {!muted && reaction && (
          <Entrance identity={reaction} style={s.reaction}>
            <View
              accessibilityLiveRegion="polite"
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Icon
                name={
                  (
                    {
                      "Quiet Nod": "nod",
                      Wave: "wave",
                      Applause: "applause",
                      "Friendly laugh": "laugh",
                    } as Record<string, string>
                  )[reaction] ?? "nod"
                }
                size={17}
              />
              <Mono style={{ fontSize: 10 }}>{reaction}</Mono>
            </View>
          </Entrance>
        )}
      </View>
      <View style={s.tableBottom}>
        {raiseControl ? (
          raiseControl
        ) : (
          <>
            <HeroDock
              hero={hero}
              equipped={equipped}
              remaining={remaining}
              active={active}
              onProfile={(anchor) => onSeat(hero, anchor)}
              compact={compact}
              awaitingDeal={host}
              handLabel={handLabel}
              dealKey={handNumber}
            />
            {paused ? (
              <Button
                label="Resume game"
                primary
                onPress={() => onResume?.()}
              />
            ) : complete ? (
              <Entrance identity={`result-${handNumber}`}>
                <View style={s.actions}>
                  <Button
                    label="Review hand"
                    onPress={onInfo}
                    style={{ flex: 1, minHeight: compact ? 52 : 60 }}
                  />
                  <Button
                    label={canContinue ? "Next hand" : "New game"}
                    primary
                    onPress={() => onNext?.()}
                    style={{ flex: 1.2, minHeight: compact ? 52 : 60 }}
                  />
                </View>
              </Entrance>
            ) : host ? (
              <Button
                label="Invite friends"
                primary
                onPress={() => onSeat(seats[0]!)}
              />
            ) : (
              <View style={s.actions}>
                <Button
                  label="Fold"
                  onPress={onFold}
                  disabled={!canAct}
                  style={{
                    flex: 0.8,
                    minHeight: compact ? 52 : 60,
                    paddingHorizontal: 6,
                  }}
                />
                <Button
                  label={callLabel}
                  onPress={onCall}
                  primary
                  disabled={!canAct}
                  pending={pending}
                  style={{
                    flex: 1.4,
                    minHeight: compact ? 52 : 60,
                    paddingHorizontal: 6,
                  }}
                />
                <Button
                  label={
                    raiseLabel ?? (callLabel === "Check" ? "Bet" : "Raise")
                  }
                  onPress={onRaise}
                  disabled={!canRaise || !canAct}
                  style={{
                    flex: 0.8,
                    minHeight: compact ? 52 : 60,
                    paddingHorizontal: 6,
                  }}
                />
              </View>
            )}
          </>
        )}
        <Mono
          accessibilityLiveRegion="polite"
          style={{
            textAlign: "center",
            color: C.textSecondary,
            fontSize: 10,
            minHeight: 15,
          }}
          numberOfLines={2}
        >
          {pending
            ? "Submitting…"
            : !active && !complete && !paused && lastEvent
              ? `${message} · ${lastEvent}`
              : message}
        </Mono>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seat: { alignItems: "center", minWidth: 44, minHeight: 44 },
  invite: {
    borderWidth: 1,
    borderColor: C.borderStrong,
    backgroundColor: "#0E0E15",
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  seatName: { fontSize: 11, marginTop: 3, maxWidth: 68, textAlign: "center" },
  stack: { fontSize: 10, color: C.textSecondary, lineHeight: 13 },
  status: { fontSize: 8, lineHeight: 12, textTransform: "capitalize" },
  blind: {
    position: "absolute",
    right: -5,
    bottom: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: C.surfaceRaised,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  arena: { flex: 1, marginHorizontal: 12, marginTop: 6, overflow: "hidden" },
  reaction: {
    position: "absolute",
    bottom: 1,
    right: 77,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    backgroundColor: C.surface,
    borderRadius: 12,
  },
  tableBottom: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10,
  },
  actions: { flexDirection: "row", gap: 7 },
});
