import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { C, F } from "./theme";
import { art, avatars } from "./assets";
import { CardReveal, Entrance, usePressMotion } from "./motion";

export function Mono({ style, ...props }: TextProps) {
  return <Text {...props} style={[s.mono, style]} />;
}
export function Icon({
  name,
  size = 22,
  color = C.textPrimary,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const paths: Record<string, string> = {
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M6 6l12 12M6 18L18 6",
    chat: "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    plus: "M12 4v16M4 12h16",
    minus: "M4 12h16",
    chevron: "M9 5l7 7-7 7",
    back: "M15 5l-7 7 7 7",
    check: "M5 12l4 4L19 6",
    share: "M8 8H5v13h14V8h-3M12 15V2M8 6l4-4 4 4",
    spade:
      "M12 3C9 7 3 10 3 14a5 5 0 0 0 9 2 5 5 0 0 0 9-2c0-4-6-7-9-11zM12 16l-3 5h6z",
    people:
      "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 10a2.5 2.5 0 1 0 0-5M2 20v-2a6 6 0 0 1 12 0v2M16 14a5 5 0 0 1 6 4v2",
    collection: "M4 3h16v18H4zM4 12h16M12 3v18",
    nod: "M7 8l1-4 4 2 4-2 1 4M7 8C3 18 7 21 12 21s9-3 5-13M8 13h2M14 13h2M10 17l2 1 2-1",
    wave: "M6 12V5a1 1 0 0 1 2 0v6V3a1 1 0 0 1 2 0v8V2a1 1 0 0 1 2 0v9V4a1 1 0 0 1 2 0v10l3-3a2 2 0 0 1 3 2l-4 7H9l-5-6a1 1 0 0 1 2-2z",
    applause: "M4 15l4-8 2 1-2 7 4-9 2 1-2 8 4-6 2 2-3 9H8zM16 2v2M20 5l2-1",
    laugh:
      "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M7 9l2-1 2 1M14 9l2-1 2 1M7 14h10l-2 4H9z",
    lock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4",
    spark: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
    arrow: "M4 12h16M14 6l6 6-6 6",
    book: "M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-7-2-10 1v15",
    history: "M3 10a9 9 0 1 1 1 7M3 4v6h6M12 7v5l3 2",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={paths[name] ?? paths.spade}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  dot = false,
}: {
  name: string;
  label: string;
  onPress: () => void;
  dot?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
    >
      <Icon name={name} />
      {dot && <View style={s.dot} />}
    </Pressable>
  );
}
export function Button({
  label,
  onPress,
  primary = false,
  disabled = false,
  pending = false,
  style,
  small = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  pending?: boolean;
  style?: ViewStyle;
  small?: boolean;
}) {
  const motion = usePressMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      onPressIn={motion.onPressIn}
      onPressOut={motion.onPressOut}
      style={({ pressed }) => [
        s.button,
        primary && s.primary,
        small && { minHeight: 44 },
        style,
        disabled && s.disabled,
        pressed && s.pressed,
      ]}
    >
      <Animated.View style={motion.style}>
        {pending ? (
          <ActivityIndicator color={primary ? C.textOnAccent : C.accent} />
        ) : (
          <Mono style={[s.buttonText, primary && { color: C.textOnAccent }]}>
            {label}
          </Mono>
        )}
      </Animated.View>
    </Pressable>
  );
}
export function Surface({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[s.surface, style]}>{children}</View>;
}
export function Wordmark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
      <Icon name="spade" size={19} color={C.gold} />
      <Mono style={s.wordmark}>FELTED</Mono>
    </View>
  );
}
export function Avatar({
  kind = "black-cat-knit",
  size = 52,
  dim = false,
}: {
  kind?: string;
  size?: number;
  dim?: boolean;
}) {
  const index = avatars[kind] ?? 7;
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        opacity: dim ? 0.7 : 1,
      }}
    >
      <Image
        source={art.avatars}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: size * 4,
          height: size * 2,
          left: -(index % 4) * size,
          top: -Math.floor(index / 4) * size,
        }}
      />
    </View>
  );
}
export function Collectible({
  index = 0,
  size = 100,
}: {
  index?: number;
  size?: number;
}) {
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <Image
        source={art.collectibles}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: size * 3,
          height: size,
          left: -index * size,
        }}
      />
    </View>
  );
}
const suitNames: Record<string, string> = {
  h: "hearts",
  s: "spades",
  d: "diamonds",
  c: "clubs",
};
const suitSymbols: Record<string, string> = {
  h: "♥",
  s: "♠",
  d: "♦",
  c: "♣",
};
const suitColors: Record<string, string> = {
  h: C.heart,
  s: C.spade,
  d: C.diamond,
  c: C.club,
};
export function PlayingCard({
  code,
  width = 34,
  rotation = 0,
  emptyLabel = "Community card not dealt",
  back = false,
  delay = 0,
  highlighted = false,
  dealKey = "",
}: {
  code?: string;
  width?: number;
  rotation?: number;
  emptyLabel?: string;
  back?: boolean;
  delay?: number;
  highlighted?: boolean;
  dealKey?: string | number;
}) {
  const rank = code?.slice(0, -1) ?? "",
    suit = code?.slice(-1) ?? "s";
  const spoken =
    ({ Q: "Queen", K: "King", J: "Jack", A: "Ace" } as Record<string, string>)[
      rank
    ] ?? rank;
  return (
    <CardReveal
      identity={`${code ?? "empty"}:${back}:${dealKey}`}
      delay={delay}
      animate={!!code || back}
    >
      <View
        accessibilityRole="text"
        accessibilityLabel={
          back
            ? "Face-down card"
            : code
              ? `${rank === "T" ? "Ten" : spoken} of ${suitNames[suit]}`
              : emptyLabel
        }
        style={[
          s.card,
          {
            width,
            height: width * 1.42,
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor:
              code && !back ? C.cardFace : back ? "#443054" : "#17102070",
            borderColor: highlighted
              ? C.accent
              : code && !back
                ? "#E8E1D5"
                : "#77588955",
            borderStyle: code || back ? "solid" : "dashed",
            shadowColor: highlighted ? C.accent : "#000000",
            shadowOpacity: code || back ? 0.3 : 0,
            shadowRadius: highlighted ? 12 : 4,
            shadowOffset: { width: 0, height: 3 },
          },
        ]}
      >
        {back ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                position: "absolute",
                inset: 2,
                borderWidth: 1,
                borderColor: "#A68DB96A",
                borderRadius: 4,
              }}
            />
            <Icon name="spade" size={width * 0.47} color={C.accent} />
          </View>
        ) : (
          code && (
            <>
              <Mono
                maxFontSizeMultiplier={1.3}
                style={{
                  fontFamily: F.strong,
                  color: suitColors[suit],
                  fontSize: width * (rank === "T" ? 0.37 : 0.43),
                  lineHeight: width * 0.51,
                }}
              >
                {rank === "T" ? "10" : rank}
              </Mono>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{
                  color: suitColors[suit],
                  fontSize: width * 0.56,
                  lineHeight: width * 0.7,
                  alignSelf: "center",
                }}
              >
                {suitSymbols[suit]}
              </Text>
            </>
          )
        )}
      </View>
    </CardReveal>
  );
}
export function TimerArc({
  size,
  remaining,
  total,
}: {
  size: number;
  remaining: number;
  total: number;
}) {
  const r = (size - 3) / 2,
    circumference = 2 * Math.PI * r;
  return (
    <Svg
      width={size}
      height={size}
      style={{ position: "absolute", left: -3, top: -3 }}
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={C.borderSubtle}
        strokeWidth={1}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={C.accent}
        strokeWidth={2}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - Math.max(0, remaining) / total)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}
export function Header({
  left = "menu",
  leftLabel = "Table menu",
  onLeft,
  onChat,
  subtitle,
}: {
  left?: string;
  leftLabel?: string;
  onLeft: () => void;
  onChat: () => void;
  subtitle?: string;
}) {
  return (
    <View style={s.header}>
      <IconButton name={left} label={leftLabel} onPress={onLeft} />
      <View style={{ alignItems: "center", gap: 3 }}>
        <Wordmark />
        {subtitle && (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: F.body,
              fontSize: 9,
              color: C.textSecondary,
              maxWidth: 200,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <IconButton name="chat" label="Chat and reactions" onPress={onChat} />
    </View>
  );
}
export function Tabs({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (screen: "table" | "club" | "reader") => void;
}) {
  return (
    <View style={s.tabs}>
      {(["table", "club", "reader"] as const).map((id, i) => (
        <Pressable
          key={id}
          accessibilityRole="tab"
          accessibilityLabel={["Play", "Home", "Collection"][i]}
          accessibilityState={{ selected: selected === id }}
          onPress={() => onSelect(id)}
          style={[s.tab, selected === id && s.selectedTab]}
        >
          <Icon
            name={["spade", "people", "collection"][i]!}
            color={selected === id ? C.accent : C.textMuted}
          />
          <Mono
            style={{
              fontSize: 11,
              fontFamily: F.ui,
              color: selected === id ? C.accent : C.textSecondary,
            }}
          >
            {["Play", "Home", "Collection"][i]}
          </Mono>
        </Pressable>
      ))}
    </View>
  );
}
export function Sheet({
  title,
  visible,
  onClose,
  reducedMotion,
  children,
}: PropsWithChildren<{
  title: string;
  visible: boolean;
  onClose: () => void;
  reducedMotion: boolean;
}>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.modal}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss sheet"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <Entrance
          identity={visible ? title : "closed"}
          distance={reducedMotion ? 0 : 22}
          duration={260}
          style={s.sheet}
        >
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text accessibilityRole="header" style={s.sheetTitle}>
              {title}
            </Text>
            <IconButton name="close" label="Close sheet" onPress={onClose} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 28 }}
          >
            {children}
          </ScrollView>
        </Entrance>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  mono: {
    fontFamily: F.regular,
    color: C.textPrimary,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  wordmark: { fontFamily: F.ui, letterSpacing: 3.5, fontSize: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: C.textPrimary,
    position: "absolute",
    right: 4,
    top: 3,
    borderRadius: 4,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderColor: C.borderSubtle,
    borderWidth: 1,
    backgroundColor: C.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontFamily: F.ui, fontSize: 15 },
  primary: {
    backgroundColor: C.accent,
    borderColor: "#E8D7FF",
    shadowColor: "#B683EF",
    shadowOpacity: 0.17,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
  surface: {
    backgroundColor: C.surface,
    borderColor: C.borderSubtle,
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: "continuous",
    padding: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 4,
    paddingTop: 2,
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  tabs: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: "#18111F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    padding: 4,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    minHeight: 50,
    gap: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  selectedTab: { backgroundColor: "#32213F" },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#000000A8",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "82%",
    backgroundColor: C.surfaceRaised,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: C.borderSubtle,
  },
  sheetHandle: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.borderStrong,
    alignSelf: "center",
    marginTop: 10,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetTitle: {
    fontSize: 30,
    fontFamily: F.display,
    color: C.textPrimary,
    flex: 1,
  },
});
