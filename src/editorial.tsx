import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon, Mono } from "./components";
import { C, F } from "./theme";

export function Eyebrow({ children }: PropsWithChildren) {
  return <Mono style={s.eyebrow}>{children}</Mono>;
}

export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={s.heading}>{title}</Text>
      {detail && <Text style={s.detail}>{detail}</Text>}
    </View>
  );
}

export function Panel({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[s.panel, style]}>{children}</View>;
}

export function Metric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text
        style={[s.metric, { color: positive ? C.positive : C.textPrimary }]}
      >
        {value}
      </Text>
      <Text style={s.detail}>{label}</Text>
    </View>
  );
}

export function Choice({
  label,
  detail,
  selected,
  onPress,
  style,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        s.choice,
        selected && { backgroundColor: "#3C2950", borderColor: C.accent },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: F.ui,
          fontSize: 15,
          color: selected ? C.accent : C.textPrimary,
        }}
      >
        {label}
      </Text>
      {detail && <Text style={s.detail}>{detail}</Text>}
      {selected && detail && (
        <View style={{ position: "absolute", right: 12, top: 12 }}>
          <Icon name="check" size={15} color={C.accent} />
        </View>
      )}
    </Pressable>
  );
}

export function MenuRow({
  title,
  detail,
  icon,
  onPress,
  label,
}: {
  title: string;
  detail?: string;
  icon: string;
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        s.menuRow,
        pressed && { backgroundColor: "#302239" },
      ]}
    >
      <View style={s.menuIcon}>
        <Icon name={icon} color={C.accent} size={20} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {detail && <Text style={s.detail}>{detail}</Text>}
      </View>
      <Icon name="chevron" size={16} color={C.textMuted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  eyebrow: { color: C.gold, fontSize: 9, letterSpacing: 1.6, lineHeight: 16 },
  heading: {
    fontFamily: F.display,
    color: C.textPrimary,
    fontSize: 29,
    lineHeight: 32,
  },
  detail: {
    fontFamily: F.body,
    color: C.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  panel: {
    backgroundColor: "#21182C",
    borderWidth: 1,
    borderColor: "#4B365E",
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  metric: { fontFamily: F.display, fontSize: 29, lineHeight: 33 },
  choice: {
    minHeight: 48,
    minWidth: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 4,
  },
  menuRow: {
    minHeight: 72,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#362442",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontFamily: F.ui, color: C.textPrimary, fontSize: 14 },
});
