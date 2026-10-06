import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { art } from "./assets";
import {
  Avatar,
  Button,
  Collectible,
  Header,
  Icon,
  IconButton,
  Mono,
  PlayingCard,
  Surface,
  TimerArc,
  Wordmark,
} from "./components";
import { compactMoney, DEMO_TURN_SECONDS, money, Seat } from "./game";
import { arenaLayout } from "./layout";
import { C, F } from "./theme";
import { Entrance } from "./motion";

export function AvatarSeat({
  seat,
  size,
  onPress,
  simple,
  acting = false,
}: {
  seat: Seat;
  size: number;
  onPress: () => void;
  simple?: boolean;
  acting?: boolean;
}) {
  const folded = seat.status === "folded";
  return (
    <Pressable
      testID={`seat-${seat.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${seat.name}, ${seat.status ?? "active"}, stack ${money(seat.stackCents)}, ${seat.positionLabel ?? ""}${seat.displayAction ?? seat.lastAction ?? ""}. Player details`}
      onPress={onPress}
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
              backgroundColor: "#101015",
            }}
          >
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
                style={s.seatName}
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
}: {
  hero: Seat;
  equipped: boolean;
  remaining: number;
  active: boolean;
  onProfile: () => void;
  compact: boolean;
  awaitingDeal?: boolean;
  handLabel?: string;
}) {
  return (
    <Surface
      style={{
        padding: 14,
        minHeight: compact ? 94 : 106,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Your profile, stack ${money(hero.stackCents)}${equipped ? ", The Reader equipped" : ""}`}
        onPress={onProfile}
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
        <Mono style={{ fontSize: 13 }}>
          {hero.status === "folded"
            ? "You · folded"
            : `You${hero.positionLabel ? ` · ${hero.positionLabel}` : ""}`}
        </Mono>
        <Mono
          numberOfLines={1}
          style={{ fontSize: 16, color: C.textSecondary }}
        >
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
              delay={i * 65}
              emptyLabel="Hole card not dealt"
              highlighted={hero.winner}
            />
          ))}
        </View>
        <Mono
          style={{
            fontSize: 9,
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
  onSeat: (seat: Seat) => void;
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
}) {
  const { height } = useWindowDimensions();
  const compact = height < 740;
  const [arena, setArena] = useState({ width: 351, height: 400 });
  const layout = arenaLayout(arena.width, arena.height, seats.length);
  return (
    <View style={{ flex: 1 }}>
      <Header onLeft={onMenu} onChat={onChat} />
      <View
        testID="arena"
        onLayout={(e) => setArena(e.nativeEvent.layout)}
        style={s.arena}
      >
        {seats.map((seat, i) => (
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
              onPress={() => onSeat(seat)}
              simple={simple}
              acting={actorId === seat.id && !paused}
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
            gap: 12,
            paddingTop: 10,
            borderRadius: 22,
            backgroundColor: "#0D0D13",
          }}
        >
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
                fontSize: 10,
                color: C.textSecondary,
                letterSpacing: 1.2,
              }}
            >
              {complete ? "AWARDED POT" : "TOTAL POT"}
            </Mono>
            <Entrance identity={potCents} distance={0} duration={160}>
              <Mono
                testID="pot"
                style={{ fontFamily: F.medium, fontSize: 26 }}
                maxFontSizeMultiplier={1.3}
              >
                {compactMoney(potCents)}
              </Mono>
            </Entrance>
          </Pressable>
          <View testID="board-cards" style={{ flexDirection: "row", gap: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <PlayingCard
                key={i}
                code={board[i]}
                width={layout.cardWidth}
                delay={i < 3 ? i * 65 : 0}
              />
            ))}
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Mono style={{ color: C.textSecondary, fontSize: 9 }}>
              $0.10 / $0.20 · NLH
            </Mono>
            {handNumber && (
              <Mono
                testID="hand-street"
                style={{
                  color: C.accent,
                  fontSize: 9,
                  textTransform: "uppercase",
                }}
              >
                #{handNumber} · {street} · practice
              </Mono>
            )}
          </View>
          {host && (
            <Mono style={{ fontSize: 10, color: C.textSecondary }}>
              Waiting for friends
            </Mono>
          )}
        </View>
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
        <HeroDock
          hero={hero}
          equipped={equipped}
          remaining={remaining}
          active={active}
          onProfile={() => onSeat(hero)}
          compact={compact}
          awaitingDeal={host}
          handLabel={handLabel}
        />
        {paused ? (
          <Button label="Resume game" primary onPress={() => onResume?.()} />
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
              label={raiseLabel ?? (callLabel === "Check" ? "Bet" : "Raise")}
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
          {pending ? "Submitting…" : message}
        </Mono>
      </View>
    </View>
  );
}

export function ClubScreen({
  onJoin,
  onHost,
  onCollection,
  onProfile,
  full = false,
  resume = false,
  playerCount = 6,
  earned = true,
  onLearn,
  onSetup,
  handsPlayed = 0,
}: {
  onJoin: () => void;
  onHost: () => void;
  onCollection: () => void;
  onProfile: () => void;
  full?: boolean;
  resume?: boolean;
  playerCount?: number;
  earned?: boolean;
  onLearn?: () => void;
  onSetup?: () => void;
  handsPlayed?: number;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.clubHeader}>
        <Wordmark />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your profile"
          onPress={onProfile}
          style={{ width: 44, height: 44 }}
        >
          <Avatar size={44} />
        </Pressable>
      </View>
      <View style={s.clubHero}>
        <Image
          source={art.clubVignette}
          resizeMode="cover"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          accessible={false}
        />
        <View style={{ paddingTop: 20 }}>
          <Text accessibilityRole="header" style={s.clubTitle}>
            The{"\n"}Night Shift
          </Text>
          <Text style={s.subtitle}>Your people. Your table.</Text>
        </View>
        <View style={s.crestLabel}>
          <Mono style={{ fontSize: 10, color: C.textSecondary }}>
            Club crest · The Reader
          </Mono>
        </View>
      </View>
      <Surface style={{ gap: 15 }}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.panelTitle}>Tonight’s table</Text>
            <Mono style={s.metadata}>NLH · 0.10 / 0.20</Mono>
            <Mono style={s.metadata}>No rake</Mono>
          </View>
          <View>
            <View style={{ flexDirection: "row" }}>
              {["cap-skater", "purple-headphones", "helmet", "fox-glasses"]
                .slice(0, Math.min(4, playerCount - 1))
                .map((kind, i) => (
                  <View
                    key={kind}
                    style={{
                      marginLeft: i ? -12 : 0,
                      borderRadius: 24,
                      backgroundColor: C.surface,
                      borderWidth: 1,
                      borderColor: C.borderStrong,
                    }}
                  >
                    <Avatar kind={kind} size={38} />
                  </View>
                ))}
            </View>
            <Mono style={[s.metadata, { fontSize: 9, marginTop: 7 }]}>
              {playerCount - 1} practice opponents
            </Mono>
          </View>
        </View>
        <Button
          label={resume ? "Resume table" : "Join table"}
          onPress={onJoin}
          primary
        />
        <View style={[s.row, { gap: 10 }]}>
          <View
            style={{
              height: 6,
              width: 6,
              borderRadius: 3,
              backgroundColor: C.positive,
            }}
          />
          <Text style={{ color: C.textSecondary, fontSize: 12, flex: 1 }}>
            {resume
              ? `${handsPlayed} hands played · your seat is saved`
              : "Real Hold’em rules. Practice chips. Your pace."}
          </Text>
          {onSetup && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Set up a practice game"
              onPress={onSetup}
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <Icon name="chevron" size={18} color={C.accent} />
            </Pressable>
          )}
        </View>
      </Surface>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Host a game"
        onPress={onHost}
        style={{ marginTop: 12 }}
      >
        <Surface style={s.row}>
          <View>
            <Text style={s.panelTitle}>Host a game</Text>
            <Mono style={s.metadata}>2–9 players</Mono>
          </View>
          <View style={s.plusCircle}>
            <Icon name="plus" />
          </View>
        </Surface>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Club collection, ${earned ? 1 : 0} earned`}
        onPress={onCollection}
        style={{ marginTop: 12 }}
      >
        <Surface style={{ paddingBottom: 8 }}>
          <View style={s.row}>
            <Mono style={{ fontSize: 14 }}>Club collection</Mono>
            <View style={[s.row, { gap: 8 }]}>
              <Mono style={{ fontSize: 10, color: C.textSecondary }}>
                {earned ? 1 : 0} earned
              </Mono>
              <Icon name="chevron" size={18} color={C.textSecondary} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 10,
            }}
          >
            {[0, 1, 2].map((index) => (
              <View key={index} style={{ opacity: index ? 0.6 : 1 }}>
                <Collectible index={index} size={85} />
              </View>
            ))}
          </View>
        </Surface>
      </Pressable>
      {onLearn && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Learn the game"
          onPress={onLearn}
          style={{ padding: 16, minHeight: 44, alignItems: "center" }}
        >
          <Mono style={{ color: C.accent, fontSize: 12 }}>
            A little knowledge goes a long way ↗
          </Mono>
        </Pressable>
      )}
    </ScrollView>
  );
}

export function ReaderScreen({
  equipped,
  onEquip,
  onCollection,
  onClose,
  onInfo,
  earned = true,
  onLearn,
}: {
  equipped: boolean;
  onEquip: () => void;
  onCollection: () => void;
  onClose: () => void;
  onInfo: () => void;
  earned?: boolean;
  onLearn?: () => void;
}) {
  const { height } = useWindowDimensions();
  const compact = height < 740;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 8 }}
    >
      <View style={[s.row, { paddingHorizontal: 16, height: 56 }]}>
        <IconButton name="close" label="Back to club" onPress={onClose} />
        <Wordmark />
        <IconButton name="share" label="Achievement details" onPress={onInfo} />
      </View>
      <Entrance identity="reader" distance={10} duration={450}>
        <View style={{ alignItems: "center", paddingTop: 16, gap: 8 }}>
          <Text accessibilityRole="header" style={s.readerTitle}>
            The Reader
          </Text>
          <Text style={s.subtitle}>A sharper eye. A calmer game.</Text>
          <View style={s.category}>
            <Mono style={{ fontSize: 9, letterSpacing: 1.5 }}>
              KNOWLEDGE · {equipped ? "EQUIPPED" : earned ? "EARNED" : "LOCKED"}
            </Mono>
          </View>
        </View>
      </Entrance>
      <View
        style={{
          height: compact ? 242 : 310,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <Image
          source={art.readerScene}
          resizeMode="cover"
          style={{
            position: "absolute",
            width: "100%",
            height: "165%",
            top: "-16%",
          }}
          accessibilityLabel="The Reader, a hollow optical glass spade on a basalt plinth"
        />
      </View>
      <View style={{ paddingHorizontal: 24, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={s.checkCircle}>
            <Icon
              name={earned ? "check" : "lock"}
              size={16}
              color={C.textOnAccent}
            />
          </View>
          <Mono style={{ fontSize: 13, flex: 1 }}>
            {earned
              ? "Knowledge milestone complete"
              : "A small practice. A sharper eye."}
          </Mono>
        </View>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
            color: C.textSecondary,
          }}
        >
          {earned
            ? "Completed the rules and side-pot practice."
            : "Learn the rules and solve one side-pot question."}
        </Text>
        <View style={s.reward}>
          <Icon name="nod" size={31} color={C.textSecondary} />
          <View
            style={{
              borderLeftWidth: 1,
              borderColor: C.borderStrong,
              paddingLeft: 18,
              gap: 5,
            }}
          >
            <Mono style={{ fontSize: 9, letterSpacing: 2, color: C.textMuted }}>
              UNLOCKS
            </Mono>
            <Mono style={{ fontSize: 12 }}>the Quiet Nod reaction</Mono>
          </View>
        </View>
        <Button
          label={
            equipped
              ? "Crest equipped"
              : earned
                ? "Equip crest"
                : "Begin the practice"
          }
          onPress={earned ? onEquip : () => onLearn?.()}
          primary={!equipped}
          disabled={equipped}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View collection"
          onPress={onCollection}
          style={{
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Mono style={{ color: C.accent, fontSize: 13 }}>View collection</Mono>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function CollectionScreen({
  earned,
  equipped,
  onReader,
  onObject,
  onProfile,
}: {
  earned: boolean;
  equipped: boolean;
  onReader: () => void;
  onObject: (index: number) => void;
  onProfile: () => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
    >
      <View style={s.clubHeader}>
        <Wordmark />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your profile"
          onPress={onProfile}
          style={{ width: 44, height: 44 }}
        >
          <Avatar size={44} />
        </Pressable>
      </View>
      <Entrance identity="collection">
        <View style={{ paddingVertical: 24, gap: 8 }}>
          <Mono style={{ color: C.accent, fontSize: 10, letterSpacing: 2 }}>
            PERSONAL OBJECTS
          </Mono>
          <Text style={s.readerTitle}>Your collection</Text>
          <Text style={s.subtitle}>Little objects. A little of you.</Text>
        </View>
      </Entrance>
      <Mono style={{ color: C.textSecondary, marginBottom: 16 }}>
        {earned ? "1 earned" : "Your first object is waiting"} · 3 objects
      </Mono>
      {["The Reader", "The Host", "Good Company"].map((name, i) => (
        <Pressable
          key={name}
          accessibilityRole="button"
          accessibilityLabel={`${name}, ${i === 0 && earned ? (equipped ? "equipped" : "earned") : "locked"}`}
          onPress={() => (i === 0 ? onReader() : onObject(i))}
          style={{ marginBottom: 12 }}
        >
          <Surface style={{ padding: 20, gap: 12 }}>
            <View
              style={{
                alignItems: "center",
                minHeight: 140,
                justifyContent: "center",
              }}
            >
              <Collectible index={i} size={150} />
            </View>
            <View style={s.row}>
              <View style={{ gap: 6 }}>
                <Text style={s.panelTitle}>{name}</Text>
                <Mono
                  style={{
                    fontSize: 10,
                    color: i === 0 && earned ? C.positive : C.textSecondary,
                  }}
                >
                  {i === 0 && earned
                    ? equipped
                      ? "Equipped"
                      : "Earned"
                    : "Locked"}
                </Mono>
              </View>
              <Icon
                name={i === 0 && earned ? "chevron" : "lock"}
                color={C.textSecondary}
              />
            </View>
            <Text
              style={{ color: C.textSecondary, lineHeight: 20, fontSize: 14 }}
            >
              {
                [
                  "Complete the rules and side-pot practice.",
                  "Bring your people together. Live hosting is still to come.",
                  "A little appreciation from someone at your table.",
                ][i]
              }
            </Text>
          </Surface>
        </Pressable>
      ))}
    </ScrollView>
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
  arena: { flex: 1, marginHorizontal: 12, marginTop: 6 },
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
  clubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
  },
  clubHero: { height: 218, overflow: "hidden" },
  clubTitle: {
    color: C.textPrimary,
    fontSize: 35,
    lineHeight: 39,
    fontWeight: "600",
    maxWidth: 240,
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  crestLabel: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    backgroundColor: "#0B0B10DD",
    borderWidth: 1,
    borderColor: C.borderSubtle,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  panelTitle: {
    color: C.textPrimary,
    fontSize: 21,
    fontWeight: "600",
    marginBottom: 4,
  },
  metadata: { color: C.textSecondary, fontSize: 10, lineHeight: 16 },
  plusCircle: {
    height: 44,
    width: 44,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  readerTitle: {
    color: C.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "600",
  },
  category: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.borderStrong,
    marginTop: 8,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  reward: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: C.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
