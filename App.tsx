import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { fontAssets } from "./src/assets";
import { Button, Collectible, Mono, Sheet, Tabs } from "./src/components";
import {
  Action,
  actionOptions,
  createDemo,
  DEMO_TURN_SECONDS,
  DemoState,
  money,
  previewSeats,
  scriptedReply,
  Seat,
  submitAction,
  visualFixture,
} from "./src/game";
import { MotionProvider } from "./src/motion";
import {
  defaults,
  loadPreferences,
  Preferences,
  savePreferences,
} from "./src/preferences";
import { TableScreen } from "./src/screens";
import { ClubScreen, CollectionScreen, ReaderScreen } from "./src/lobby";
import { Anchor, FloatingPlayerCard } from "./src/player-card";
import { InlineRaise } from "./src/raise-control";
import { ChatSheet, Copy, HostSheet, Settings, Toggle } from "./src/sheets";
import { C } from "./src/theme";
import {
  defaultProfile,
  loadProfile,
  Profile,
  saveProfile,
} from "./src/profile";
import { PersonalScreen, ProfileEditor } from "./src/personal";
import { Eyebrow, MenuRow, Panel, SectionHeading } from "./src/editorial";
import { holeLabel } from "./src/poker/cards";
import {
  act,
  advanceRunout,
  Hand,
  legalActions,
  nextHand,
  positions,
  potTotal,
  practicePlayers,
  startHand,
} from "./src/poker/engine";
import { chooseBotAction } from "./src/poker/bots";
import {
  loadSession,
  newSession,
  saveSession,
  Session,
  updateSession,
} from "./src/poker/session";
import {
  GameSetup,
  HandDetails,
  LearnPoker,
  SessionDetails,
} from "./src/poker/sheets";

type Screen = "table" | "club" | "reader" | "collection" | "personal";
type Modal =
  | null
  | "menu"
  | "settings"
  | "profile"
  | "preview"
  | "raise"
  | "host"
  | "object"
  | "player"
  | "chat"
  | "info"
  | "achievement"
  | "setup"
  | "learn"
  | "session";
const query =
  __DEV__ && Platform.OS === "web"
    ? new URLSearchParams(globalThis.location?.search)
    : new URLSearchParams();
const initialScreen: Screen = ["table", "reader", "collection"].includes(
  query.get("screen") ?? "",
)
  ? (query.get("screen") as Screen)
  : "club";
const initialCount = Math.min(
  9,
  Math.max(2, Math.trunc(Number(query.get("count"))) || 6),
);
let seed = Number(query.get("seed")) >>> 0;
const gameRandom = query.has("seed")
  ? () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    }
  : Math.random;
const fastReview = query.get("speed") === "fast";

function asSeats(hand: Hand): Seat[] {
  const labels = positions(hand);
  return hand.players.map((player) => ({
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    stackCents: player.stackCents,
    status: player.status,
    positionLabel: labels[player.id],
    lastAction: player.lastAction,
    displayContributionCents: player.streetCents || undefined,
    holeCards:
      player.id === "hero" ||
      (hand.result?.reason === "showdown" && player.status !== "folded")
        ? player.holeCards
        : undefined,
    revealed: hand.result?.reason === "showdown" && player.status !== "folded",
    winner: !!hand.result?.winnerIds.includes(player.id),
  }));
}

function Felted() {
  const insets = useSafeAreaInsets();
  const [fonts, fontError] = useFonts(fontAssets);
  const [preferences, setPreferences] = useState<Preferences>(defaults),
    [stored, setStored] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [selectedHistory, setSelectedHistory] = useState<number | null>(null);
  const [storageError, setStorageError] = useState(false),
    [sessionError, setSessionError] = useState(false);
  const [screen, setScreen] = useState<Screen>(initialScreen),
    [modal, setModal] = useState<Modal>(null);
  const [mode, setMode] = useState<"visual" | "demo" | "play">(
    query.get("mode") === "demo"
      ? "demo"
      : query.get("mode") === "visual" ||
          (query.has("count") && query.get("mode") !== "play")
        ? "visual"
        : "play",
  );
  const [session, setSession] = useState<Session | null>(null),
    [paused, setPaused] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState !== "background" &&
      AppState.currentState !== "inactive",
  );
  const sessionRef = useRef<Session | null>(null);
  const [count, setCount] = useState(initialCount),
    [river, setRiver] = useState(query.get("river") === "1"),
    [longNames, setLongNames] = useState(query.get("long") === "1");
  const [largeText, setLargeText] = useState(query.get("large") === "1"),
    [systemReduced, setSystemReduced] = useState(false);
  const [demo, setDemo] = useState<DemoState>(() =>
    createDemo(query.get("unopened") === "1"),
  );
  const [pending, setPending] = useState(false),
    [feedback, setFeedback] = useState(""),
    [reaction, setReaction] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null),
    [objectIndex, setObjectIndex] = useState(1);
  const [playerAnchor, setPlayerAnchor] = useState<Anchor | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(
      Date.now() + DEMO_TURN_SECONDS * 1000,
    ),
    [now, setNow] = useState(Date.now());
  const deadlineRef = useRef(deadline);
  const { fontScale } = useWindowDimensions();
  const demoLock = useRef(false),
    demoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardSound = useAudioPlayer(require("./assets/audio/card.wav"));
  const chipSound = useAudioPlayer(require("./assets/audio/chip.wav"));
  const successSound = useAudioPlayer(require("./assets/audio/success.wav"));
  const hand = session?.hand,
    playing = mode === "play" && !!hand;
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const reducedMotion = systemReduced || preferences.reducedMotion;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    document
      .querySelector('meta[name="viewport"]')
      ?.setAttribute(
        "content",
        "width=device-width, initial-scale=1, viewport-fit=cover",
      );
    const root = document.getElementById("root");
    const viewport = window.visualViewport;
    const resize = () => {
      if (!root) return;
      const keyboardVisible =
        viewport &&
        viewport.scale === 1 &&
        window.innerHeight - viewport.height > 120;
      root.style.height = keyboardVisible ? `${viewport.height}px` : "";
    };
    viewport?.addEventListener("resize", resize);
    resize();
    return () => {
      viewport?.removeEventListener("resize", resize);
      if (root) root.style.height = "";
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadProfile()
        .then((value) => {
          if (mounted) setProfile(value);
        })
        .catch(() => {
          if (mounted) setStorageError(true);
        }),
      loadPreferences()
        .then((value) => {
          if (mounted) setPreferences(value);
        })
        .catch(() => {
          if (mounted) setStorageError(true);
        }),
      loadSession()
        .then((value) => {
          if (!mounted) return;
          const restored =
            value ??
            (initialScreen === "table" && mode === "play"
              ? newSession(
                  startHand(practicePlayers(initialCount), {
                    random: gameRandom,
                  }),
                )
              : null);
          sessionRef.current = restored;
          setSession(restored);
        })
        .catch(() => {
          if (mounted) {
            setSessionError(true);
            setScreen("club");
          }
        }),
    ]).finally(() => {
      if (mounted) setStored(true);
    });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!stored) return;
    const current = sessionRef.current;
    const currentHero = current?.hand.players.find(
      (player) => player.id === "hero",
    );
    if (
      !current ||
      !currentHero ||
      (currentHero.name === profile.name &&
        currentHero.avatar === profile.avatar)
    )
      return;
    // Identity changes preserve every card, wager, payout and historic event.
    const next = {
      ...current,
      hand: {
        ...current.hand,
        players: current.hand.players.map((player) =>
          player.id === "hero"
            ? { ...player, name: profile.name, avatar: profile.avatar }
            : player,
        ),
      },
    };
    sessionRef.current = next;
    setSession(next);
  }, [stored, profile]);
  useEffect(() => {
    if (stored && session)
      saveSession(session)
        .then(() => setSessionError(false))
        .catch(() => setSessionError(true));
  }, [session, stored]);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setSystemReduced)
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => listener.remove();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      if (demoTimeout.current) clearTimeout(demoTimeout.current);
    };
  }, []);
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (modal) setModal(null);
      else if (screen !== "club") setScreen("club");
      else return false;
      return true;
    });
    return () => handler.remove();
  }, [modal, screen]);
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active"),
    );
    return () => listener.remove();
  }, []);
  useEffect(() => {
    deadlineRef.current = Date.now() + DEMO_TURN_SECONDS * 1000;
    setDeadline(deadlineRef.current);
    setNow(Date.now());
    setFeedback("");
  }, [hand, screen, paused, mode, appActive]);
  useEffect(() => {
    if (
      !playing ||
      !hand ||
      screen !== "table" ||
      paused ||
      !appActive ||
      hand.phase === "complete" ||
      hand.actorId === "hero"
    )
      return;
    const timer = setTimeout(
      () => {
        const current = sessionRef.current?.hand;
        if (!current || current !== hand) return;
        try {
          if (current.phase === "runout") commitHand(advanceRunout(current));
          else {
            const choice = chooseBotAction(
              current,
              current.actorId!,
              gameRandom,
            );
            commitHand(
              act(current, current.actorId!, choice.action, choice.amount),
            );
          }
        } catch (error) {
          setFeedback(
            error instanceof Error
              ? error.message
              : "The table could not advance.",
          );
          setPaused(true);
        }
      },
      fastReview
        ? 35
        : hand.phase === "runout"
          ? 950
          : 850 + gameRandom() * 500,
    );
    return () => clearTimeout(timer);
  }, [hand, playing, screen, paused, appActive]);
  useEffect(() => {
    if (
      !playing ||
      !hand ||
      screen !== "table" ||
      paused ||
      !appActive ||
      remaining > 0 ||
      hand.actorId !== "hero"
    )
      return;
    const current = sessionRef.current?.hand;
    if (current?.actorId === "hero" && Date.now() >= deadlineRef.current) {
      commitHand(
        act(
          current,
          "hero",
          legalActions(current, "hero").check ? "check" : "fold",
        ),
      );
      setModal(null);
    }
  }, [remaining, playing, screen, paused, hand?.actorId, appActive]);
  useEffect(() => {
    if (
      mode !== "demo" ||
      pending ||
      !["jules", "rune"].includes(demo.actor ?? "") ||
      screen !== "table"
    )
      return;
    const timer = setTimeout(
      () => setDemo((value) => scriptedReply(value)),
      1500,
    );
    return () => clearTimeout(timer);
  }, [demo.actor, mode, pending, screen]);
  useEffect(() => {
    if (!reaction) return;
    const timer = setTimeout(() => setReaction(null), 3500);
    return () => clearTimeout(timer);
  }, [reaction]);
  useEffect(() => {
    if (playing && hand?.board.length) tactile("card");
  }, [hand?.number, hand?.board.length]);
  useEffect(() => {
    if (playing && hand?.result?.winnerIds.includes("hero")) tactile("success");
  }, [hand?.number, hand?.phase]);

  function commitHand(next: Hand) {
    const current = sessionRef.current;
    if (!current) return;
    const updated = updateSession(current, next);
    sessionRef.current = updated;
    setSession(updated);
  }
  function persist(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    savePreferences(next)
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }
  function tactile(kind: "card" | "chip" | "success") {
    if (preferences.haptics && Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (preferences.sound) {
      const player =
        kind === "card"
          ? cardSound
          : kind === "chip"
            ? chipSound
            : successSound;
      player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => {});
    }
  }
  function startGame(
    players = 6,
    stack = 10000,
    tableName = "The Night Shift",
  ) {
    const next = newSession(
      startHand(
        practicePlayers(players, stack).map((player) =>
          player.id === "hero"
            ? { ...player, name: profile.name, avatar: profile.avatar }
            : player,
        ),
        {
          tableName,
          random: gameRandom,
        },
      ),
    );
    sessionRef.current = next;
    setSession(next);
    setMode("play");
    setScreen("table");
    setPaused(false);
    setModal(null);
    setFeedback("");
    setMessages([]);
    tactile("card");
  }
  function joinTable() {
    if (!sessionRef.current) {
      startGame();
      return;
    }
    setMode("play");
    setScreen("table");
    setPaused(false);
    setModal(null);
  }
  function resetDemo(unopened = false) {
    if (demoTimeout.current) clearTimeout(demoTimeout.current);
    demoLock.current = false;
    setPending(false);
    setDemo(createDemo(unopened));
    setMode("demo");
    setScreen("table");
    setFeedback("");
    setDeadline(Date.now() + DEMO_TURN_SECONDS * 1000);
    setNow(Date.now());
    setModal(null);
  }
  function action(action: Action, amount?: number) {
    if (playing && hand) {
      const current = sessionRef.current?.hand;
      if (paused || !current || current !== hand) return;
      try {
        commitHand(act(current, "hero", action, amount));
        setModal(null);
        setFeedback("");
        tactile("chip");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Action rejected.",
        );
      }
      return;
    }
    if (demoLock.current || mode !== "demo" || remaining === 0) return;
    try {
      const next = submitAction(demo, action, amount);
      demoLock.current = true;
      setPending(true);
      setModal(null);
      demoTimeout.current = setTimeout(() => {
        setDemo(next);
        setPending(false);
        tactile("chip");
      }, 450);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Action rejected.");
    }
  }
  function continueGame() {
    if (!canContinue) {
      setModal("setup");
      return;
    }
    const current = sessionRef.current?.hand;
    if (!current || current !== hand || current.phase !== "complete") return;
    commitHand(nextHand(current, gameRandom));
    tactile("card");
  }
  const options = playing ? legalActions(hand, "hero") : actionOptions(demo);
  const visualHero: Seat = {
    ...visualFixture.seats.find((seat) => seat.id === "hero")!,
    ...(mode === "play" ? profile : {}),
    stackCents: mode === "visual" ? 9860 : 10000,
  };
  const pokerSeats = hand ? asSeats(hand) : [];
  const hero: Seat = playing
    ? pokerSeats.find((seat) => seat.id === "hero")!
    : mode === "demo"
      ? demo.seats.find((seat) => seat.id === "hero")!
      : {
          ...visualHero,
          positionLabel: count === 2 ? "D / SB" : undefined,
          stackCents: longNames ? 123456789 : visualHero.stackCents,
        };
  const seats: Seat[] = playing
    ? pokerSeats.filter((seat) => seat.id !== "hero")
    : mode === "demo"
      ? demo.seats.filter((seat) => seat.id !== "hero")
      : previewSeats(count, longNames);
  const potCents = playing
    ? (hand.result?.potCents ?? potTotal(hand))
    : mode === "demo"
      ? demo.potCents
      : longNames
        ? 123456789
        : visualFixture.potCents;
  const board = playing
    ? hand.board
    : mode === "demo"
      ? demo.board
      : river
        ? ["Qh", "8s", "5d", "2c", "As"]
        : visualFixture.board;
  const canAct =
    (playing || mode === "demo") &&
    options.active &&
    !pending &&
    remaining > 0 &&
    !paused;
  useEffect(() => {
    if (modal === "raise" && !canAct) setModal(null);
  }, [modal, canAct]);
  function openPlayer(seat: Seat, anchor?: Anchor) {
    setSelectedSeat(seat);
    setPlayerAnchor(anchor ?? null);
    setModal("player");
  }
  function openHistory(handNumber?: number) {
    setSelectedHistory(handNumber ?? null);
    setModal("session");
  }
  const callLabel =
    playing || mode === "demo"
      ? options.owed
        ? `Call ${options.allInCall ? "all-in " : ""}${money(options.callCents)}`
        : "Check"
      : "Call $4.60";
  const canContinue =
    !!hand &&
    hand.players.find((player) => player.id === "hero")!.stackCents > 0 &&
    hand.players.filter((player) => player.stackCents > 0).length >= 2;
  const outcome = hand?.result
    ? hand.result.winnerIds
        .map(
          (id) =>
            `${hand.players.find((player) => player.id === id)!.name} wins ${money(hand.result!.awards[id]!)}${hand.result!.hands[id] ? ` · ${hand.result!.hands[id]!.name}` : ""}`,
        )
        .join(" / ")
    : "";
  const message =
    feedback ||
    (playing
      ? paused
        ? "Game paused · take your time"
        : outcome ||
          (hand.phase === "runout"
            ? "Betting complete · running out the board"
            : hand.actorId === "hero"
              ? `Your turn · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
              : `${hand.players.find((player) => player.id === hand.actorId)?.name ?? "Table"} is thinking…`)
      : mode === "demo"
        ? demo.actor === "hero"
          ? `Your turn · ${remaining}s`
          : demo.message
        : "Design reference · visual only");
  const titles: Record<string, string> = {
    menu: "Your table",
    settings: "Your preferences",
    profile: "Make it yours",
    preview: "Developer preview",
    raise: (playing ? hand.currentBetCents : demo.currentBetCents)
      ? "Raise to"
      : "Bet amount",
    host: "Host a game",
    object: objectIndex === 1 ? "The Host" : "Good Company",
    player: selectedSeat?.id === "hero" ? "Your seat" : "Player",
    chat: "At the table",
    info: playing ? `Hand #${hand.number}` : "Hand details",
    achievement: "The Reader",
    setup: "Find your rhythm",
    learn: "A calmer game",
    session: "Your session",
  };

  if (fontError)
    return (
      <View style={s.loading}>
        <Text style={{ color: C.textPrimary }}>
          Felted couldn’t load its fonts.
        </Text>
        <Text style={{ color: C.textSecondary }}>
          Restart the app to try again.
        </Text>
      </View>
    );
  if (!fonts || !stored)
    return (
      <View style={s.loading}>
        <ActivityIndicator color={C.accent} />
        <Text style={{ color: C.textSecondary }}>Opening Felted…</Text>
      </View>
    );

  return (
    <MotionProvider value={reducedMotion}>
      <SafeAreaView edges={["top", "bottom"]} style={s.safe}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top}
          style={[
            s.app,
            Platform.OS === "web" && { paddingTop: 12, paddingBottom: 8 },
          ]}
        >
          {screen === "club" && (
            <ClubScreen
              onJoin={joinTable}
              onHost={() => setModal("host")}
              onCollection={() => setScreen("collection")}
              onProfile={(anchor) => {
                openPlayer(
                  hand
                    ? asSeats(hand).find((seat) => seat.id === "hero")!
                    : visualHero,
                  anchor,
                );
              }}
              resume={!!session}
              playerCount={hand?.players.length ?? 6}
              tableName={hand?.tableName}
              earned={preferences.learned}
              handsPlayed={session?.handsPlayed ?? 0}
              onLearn={() => setModal("learn")}
              onSetup={() => setModal("setup")}
              onSettings={() => setModal("settings")}
              avatar={profile.avatar}
            />
          )}
          {screen === "collection" && (
            <CollectionScreen
              earned={preferences.learned}
              equipped={preferences.equipped}
              onReader={() => setScreen("reader")}
              onObject={(index) => {
                setObjectIndex(index);
                setModal("object");
              }}
              onProfile={(anchor) => openPlayer(hero, anchor)}
              onSettings={() => setModal("settings")}
              avatar={profile.avatar}
            />
          )}
          {screen === "personal" && (
            <PersonalScreen
              profile={profile}
              session={session}
              equipped={preferences.equipped}
              learned={preferences.learned}
              onEdit={() => setModal("profile")}
              onJoin={joinTable}
              onHistory={openHistory}
              onLearn={() => setModal("learn")}
              onSettings={() => setModal("settings")}
              onCollection={() => setScreen("collection")}
            />
          )}
          {screen === "reader" && (
            <ReaderScreen
              earned={preferences.learned}
              equipped={preferences.equipped}
              onEquip={() => {
                if (preferences.learned) {
                  persist({ equipped: true });
                  tactile("success");
                }
              }}
              onLearn={() => setModal("learn")}
              onCollection={() => setScreen("collection")}
              onClose={() => setScreen("collection")}
              onInfo={() => setModal("achievement")}
            />
          )}
          {screen === "table" && (
            <TableScreen
              seats={seats}
              hero={hero}
              potCents={potCents}
              heroAwardCents={playing ? hand.result?.awards.hero : undefined}
              board={board}
              equipped={preferences.equipped || mode === "visual"}
              remaining={remaining}
              active={canAct}
              pending={pending}
              message={message}
              callLabel={callLabel}
              raiseLabel={
                (playing ? hand.currentBetCents : demo.currentBetCents)
                  ? "Raise"
                  : "Bet"
              }
              canRaise={options.raise}
              canAct={canAct}
              muted={preferences.muted}
              reaction={reaction}
              simple={preferences.simpleLayout || largeText || fontScale > 1.25}
              host={false}
              actorId={playing ? hand.actorId : null}
              handLabel={
                playing
                  ? hero.status === "out"
                    ? "Sitting out"
                    : holeLabel(
                        hand.players.find((player) => player.id === "hero")!
                          .holeCards,
                        board,
                      )
                  : undefined
              }
              handNumber={playing ? hand.number : undefined}
              tableName={playing ? hand.tableName : "The Night Shift"}
              lastEvent={playing ? hand.events.at(-1)?.text : undefined}
              street={playing ? hand.street : undefined}
              complete={playing && hand.phase === "complete"}
              canContinue={canContinue}
              onNext={continueGame}
              paused={playing && paused}
              onResume={() => setPaused(false)}
              onMenu={() => setModal("menu")}
              onChat={() => setModal("chat")}
              onSeat={(seat, anchor) => {
                if (seat.status === "empty") {
                  setModal("setup");
                  return;
                }
                openPlayer(seat, anchor);
              }}
              onInfo={() => setModal("info")}
              onFold={() => action("fold")}
              onCall={() => action(options.check ? "check" : "call")}
              onRaise={() => setModal("raise")}
              raiseControl={
                modal === "raise" && canAct ? (
                  <InlineRaise
                    key={`${playing ? hand.number : 0}:${playing ? hand.revision : demo.actor}`}
                    state={playing ? hand : demo}
                    holeCards={hero.holeCards}
                    onCancel={() => setModal(null)}
                    onSubmit={(amount) =>
                      action(
                        (playing ? hand.currentBetCents : demo.currentBetCents)
                          ? "raise"
                          : "bet",
                        amount,
                      )
                    }
                  />
                ) : undefined
              }
            />
          )}
          {screen !== "table" && (
            <Tabs
              selected={screen === "collection" ? "reader" : screen}
              onSelect={(selected) =>
                selected === "table"
                  ? joinTable()
                  : setScreen(selected === "reader" ? "collection" : selected)
              }
            />
          )}
          {(storageError || sessionError) && (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: C.warning, fontSize: 11, padding: 8 }}
            >
              {sessionError
                ? "Saved table unavailable. You can continue playing on this device."
                : "Settings work for this session; device storage is unavailable."}
            </Text>
          )}
        </KeyboardAvoidingView>
        <Sheet
          title={titles[modal ?? ""] ?? ""}
          visible={modal !== null && modal !== "raise" && modal !== "player"}
          onClose={() => setModal(null)}
          reducedMotion={reducedMotion}
        >
          {modal === "profile" && (
            <ProfileEditor
              profile={profile}
              onSave={(value) => {
                setProfile(value);
                saveProfile(value)
                  .then(() => setStorageError(false))
                  .catch(() => setStorageError(true));
                setModal(null);
                tactile("success");
              }}
            />
          )}
          {modal === "settings" && (
            <Settings preferences={preferences} onChange={persist} />
          )}
          {modal === "menu" && (
            <>
              <Panel>
                <Eyebrow>
                  {paused ? "TAKING A BREATHER" : "YOUR PRACTICE TABLE"}
                </Eyebrow>
                <SectionHeading
                  title={playing ? hand.tableName : "The Night Shift"}
                  detail={`No-limit Hold’em · $0.10 / $0.20${playing ? ` · ${hand.players.length} seats` : ""}`}
                />
                {playing && (
                  <Copy>
                    Hand #{hand.number} ·{" "}
                    {hand.phase === "complete"
                      ? "Ready for the next deal"
                      : hand.street}
                  </Copy>
                )}
              </Panel>
              <Button
                label="Leave table"
                onPress={() => {
                  setScreen("club");
                  setModal(null);
                }}
              />
              {playing && (
                <>
                  <MenuRow
                    title={paused ? "Resume game" : "Pause game"}
                    detail={
                      paused
                        ? "Back to your next decision."
                        : "Hold your place. Take a breath."
                    }
                    icon="pause"
                    onPress={() => {
                      setPaused(!paused);
                      setModal(null);
                    }}
                  />
                  <MenuRow
                    title="Session & hand history"
                    detail="Your results and your latest 20 hands."
                    icon="history"
                    onPress={() => openHistory()}
                  />
                  <MenuRow
                    title="Review current hand"
                    detail="Cards, pots, and every decision."
                    icon="spade"
                    onPress={() => setModal("info")}
                  />
                  <MenuRow
                    title="New practice game"
                    detail="A fresh table with your choice of seats."
                    icon="plus"
                    onPress={() => setModal("setup")}
                  />
                  <MenuRow
                    title="Learn the game"
                    detail="A visual guide to hands and side pots."
                    icon="book"
                    onPress={() => setModal("learn")}
                  />
                </>
              )}
              <MenuRow
                title="Your preferences"
                detail="Sound, motion and table comfort."
                icon="settings"
                onPress={() => setModal("settings")}
              />
              <MenuRow
                title="Your seat & profile"
                detail="Make a little room for your personality."
                icon="profile"
                onPress={() => {
                  setModal(null);
                  setScreen("personal");
                }}
              />
              {mode === "demo" && (
                <Button label="Reset hand demo" onPress={() => resetDemo()} />
              )}
              {__DEV__ && (
                <Button
                  label="Developer preview"
                  onPress={() => setModal("preview")}
                />
              )}
            </>
          )}
          {modal === "preview" && (
            <>
              <Copy>
                Design references and the original action seed are separate from
                the live practice engine.
              </Copy>
              <Button
                label="Static reference"
                onPress={() => {
                  setMode("visual");
                  setCount(8);
                  setRiver(false);
                  setLongNames(false);
                  setModal(null);
                }}
              />
              <Mono>Occupied players</Mono>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
                  <Button
                    key={n}
                    small
                    label={`${n} players`}
                    primary={count === n && mode === "visual"}
                    onPress={() => {
                      setCount(n);
                      setMode("visual");
                      setModal(null);
                    }}
                  />
                ))}
              </View>
              <Toggle
                label="Five community cards"
                value={river}
                onChange={setRiver}
              />
              <Toggle
                label="Long names and large amounts"
                value={longNames}
                onChange={setLongNames}
              />
              <Toggle
                label="Accessible player list"
                value={largeText}
                onChange={setLargeText}
              />
              <Button
                label="Original call / raise seed"
                onPress={() => resetDemo()}
              />
              <Button
                label="Original check / bet seed"
                onPress={() => resetDemo(true)}
              />
              <Button
                label="Return to practice table"
                primary
                onPress={joinTable}
              />
            </>
          )}
          {modal === "host" && (
            <HostSheet
              avatar={profile.avatar}
              replacing={!!session}
              onCreate={(name, capacity) => startGame(capacity, 10000, name)}
            />
          )}
          {modal === "setup" && (
            <GameSetup
              replacing={!!session}
              avatar={profile.avatar}
              onStart={(players, stack) => startGame(players, stack)}
            />
          )}
          {modal === "learn" && (
            <LearnPoker
              complete={preferences.learned}
              onComplete={() => {
                persist({ learned: true });
                setScreen("reader");
                setModal(null);
                tactile("success");
              }}
            />
          )}
          {modal === "session" && session && (
            <SessionDetails
              session={session}
              initialHandNumber={selectedHistory}
            />
          )}
          {modal === "object" && (
            <>
              <View style={{ alignItems: "center" }}>
                <Collectible index={objectIndex} size={190} />
              </View>
              <Mono>Locked · a future shared milestone</Mono>
              <Copy>
                {objectIndex === 1
                  ? "The Host celebrates your first completed session with friends. Live hosting and invitations are still to come."
                  : "Good Company celebrates optional appreciation from a friend after a shared session. Shared profiles are still to come."}
              </Copy>
              <Button label="Not yet earned" disabled onPress={() => {}} />
              <Button
                label="Back to collection"
                onPress={() => {
                  setScreen("collection");
                  setModal(null);
                }}
              />
            </>
          )}
          {modal === "chat" && (
            <ChatSheet
              messages={messages}
              onSend={(text) =>
                setMessages((value) => [...value, text].slice(-40))
              }
              muted={preferences.muted}
              onMute={(muted) => persist({ muted })}
              onReaction={(name) => {
                if (!preferences.muted) setReaction(name);
                setModal(null);
              }}
            />
          )}
          {modal === "info" &&
            (playing ? (
              <HandDetails hand={hand} />
            ) : (
              <>
                <Mono>Total pot {money(potCents)}</Mono>
                <Copy>
                  {mode === "visual"
                    ? "Static visual comparison. This is a design reference."
                    : "Original scripted action seed. Use the practice table for full poker rules."}
                </Copy>
                {[hero, ...seats]
                  .filter((seat) => seat.status !== "empty")
                  .map((seat) => (
                    <Button
                      key={seat.id}
                      label={`${seat.name} · ${money(seat.stackCents)}`}
                      onPress={() => {
                        setSelectedSeat(seat);
                        setModal("player");
                      }}
                    />
                  ))}
              </>
            ))}
          {modal === "achievement" && (
            <>
              <View style={{ alignItems: "center" }}>
                <Collectible size={170} />
              </View>
              <Mono>
                Knowledge ·{" "}
                {preferences.equipped
                  ? "Equipped"
                  : preferences.learned
                    ? "Earned"
                    : "Locked"}
              </Mono>
              <Copy>
                The Reader recognizes completion of the rules and side-pot
                practice.
              </Copy>
              <Button
                label={
                  preferences.learned
                    ? "Revisit the practice"
                    : "Begin the practice"
                }
                primary
                onPress={() => setModal("learn")}
              />
            </>
          )}
        </Sheet>
        {modal === "player" && selectedSeat && (
          <FloatingPlayerCard
            seat={
              playing
                ? (pokerSeats.find((seat) => seat.id === selectedSeat.id) ??
                  selectedSeat)
                : selectedSeat
            }
            anchor={playerAnchor}
            equipped={preferences.equipped}
            onClose={() => setModal(null)}
            onJoin={
              !session && selectedSeat.id === "hero" ? joinTable : undefined
            }
            onHistory={
              selectedSeat.id === "hero" && session
                ? () => openHistory()
                : undefined
            }
            onEdit={
              selectedSeat.id === "hero"
                ? () => {
                    setModal(null);
                    setScreen("personal");
                  }
                : undefined
            }
          />
        )}
      </SafeAreaView>
    </MotionProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Felted />
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.canvas },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: C.canvas,
  },
  loading: {
    flex: 1,
    backgroundColor: C.canvas,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});
