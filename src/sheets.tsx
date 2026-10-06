import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar, Button, Collectible, Icon, Mono, Surface } from "./components";
import {
  actionOptions,
  DemoState,
  money,
  parseAmount,
  Seat,
  validateAmount,
} from "./game";
import { Preferences } from "./preferences";
import { C, F } from "./theme";
import { Hand, legalActions, potTotal, validateWager } from "./poker/engine";

export function Copy({ children }: React.PropsWithChildren) {
  return <Text style={s.copy}>{children}</Text>;
}
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      onPress={() => onChange(!value)}
      style={s.toggle}
    >
      <Copy>{label}</Copy>
      <View
        accessible={false}
        style={{
          width: 48,
          height: 28,
          borderRadius: 16,
          padding: 3,
          backgroundColor: value ? C.accent : C.borderSubtle,
          alignItems: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 12,
            backgroundColor: C.textPrimary,
          }}
        />
      </View>
    </Pressable>
  );
}
export function Settings({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (p: Partial<Preferences>) => void;
}) {
  return (
    <>
      <Toggle
        label="Mute reactions"
        value={preferences.muted}
        onChange={(muted) => onChange({ muted })}
      />
      <Toggle
        label="Sound"
        value={preferences.sound}
        onChange={(sound) => onChange({ sound })}
      />
      <Toggle
        label="Haptics"
        value={preferences.haptics}
        onChange={(haptics) => onChange({ haptics })}
      />
      <Toggle
        label="Reduce motion"
        value={preferences.reducedMotion}
        onChange={(reducedMotion) => onChange({ reducedMotion })}
      />
    </>
  );
}
export function RaiseSheet({
  state,
  onSubmit,
}: {
  state: DemoState | Hand;
  onSubmit: (amount: number) => void;
}) {
  const engine = "players" in state;
  const bounds = engine ? legalActions(state, "hero") : actionOptions(state),
    bet = state.currentBetCents === 0;
  const [input, setInput] = useState((bounds.minimum / 100).toFixed(2));
  const amount = parseAmount(input),
    error = engine
      ? validateWager(state, "hero", amount)
      : validateAmount(state, amount);
  const setAmount = (value: number) =>
    setInput(
      (Math.max(bounds.minimum, Math.min(bounds.maximum, value)) / 100).toFixed(
        2,
      ),
    );
  const step = engine ? state.bigBlindCents : 20;
  const pot = engine ? potTotal(state) : state.potCents;
  return (
    <>
      <Copy>{bet ? "Bet amount" : "Raise to"} · total on this street</Copy>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Button
          label="−"
          onPress={() => setAmount((amount ?? bounds.minimum) - step)}
          small
        />
        <TextInput
          accessibilityLabel={bet ? "Bet amount" : "Raise total amount"}
          keyboardType="decimal-pad"
          value={input}
          onChangeText={setInput}
          selectTextOnFocus
          style={[
            s.input,
            {
              flex: 1,
              fontSize: 30,
              fontFamily: F.medium,
              textAlign: "center",
            },
          ]}
        />
        <Button
          label="+"
          onPress={() => setAmount((amount ?? bounds.minimum) + step)}
          small
        />
      </View>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {[
          ["Minimum", bounds.minimum],
          [
            "½ pot",
            state.currentBetCents + Math.round((pot + bounds.owed) / 2),
          ],
          ["Pot", state.currentBetCents + pot + bounds.owed],
          ["All-in", bounds.maximum],
        ].map(([label, value]) => (
          <Button
            key={label}
            small
            label={String(label)}
            onPress={() => setAmount(Number(value))}
            style={{ flexGrow: 1, minWidth: 64, paddingHorizontal: 8 }}
          />
        ))}
      </View>
      <Mono style={s.meta}>
        Minimum {money(bounds.minimum)} · Maximum {money(bounds.maximum)}
      </Mono>
      <Copy>
        {amount !== null && !error
          ? `${money(amount - bounds.contributed)} more will be committed.`
          : "Choose a legal total before submitting."}
      </Copy>
      {engine && "shortAllIn" in bounds && bounds.shortAllIn && (
        <Copy>
          Your stack permits a short all-in. It may not reopen a previous
          player’s raise.
        </Copy>
      )}
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: C.error, fontSize: 14 }}
        >
          {error}
        </Text>
      )}
      <Button
        label={`${bet ? "Bet" : "Raise to"} ${amount === null ? "—" : money(amount)}`}
        primary
        disabled={!!error}
        onPress={() => amount !== null && onSubmit(amount)}
      />
    </>
  );
}
export function HostSheet({
  onCreate,
}: {
  onCreate: (name: string, capacity: number) => void;
}) {
  const [name, setName] = useState("The Night Shift"),
    [capacity, setCapacity] = useState(6);
  return (
    <>
      <Copy>Make the table your own.</Copy>
      <TextInput
        accessibilityLabel="Table name"
        value={name}
        maxLength={48}
        onChangeText={setName}
        style={s.input}
      />
      <Mono>Seats</Mono>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
          <Button
            key={n}
            label={`${n}`}
            small
            primary={capacity === n}
            onPress={() => setCapacity(n)}
            style={{ minWidth: 52 }}
          />
        ))}
      </View>
      <Mono style={s.meta}>NLH · $0.10 / $0.20 · No rake</Mono>
      <Copy>
        Play locally with automated opponents and $100 in practice chips each.
        Live invitations are still to come.
      </Copy>
      <Button
        label="Create table"
        primary
        disabled={!name.trim()}
        onPress={() => onCreate(name.trim(), capacity)}
      />
    </>
  );
}
export function CollectionSheet({
  equipped,
  earned = true,
  onReader,
  onObject,
}: {
  equipped: boolean;
  earned?: boolean;
  onReader: () => void;
  onObject: (index: number) => void;
}) {
  return (
    <>
      <Copy>
        Objects with a story. Earned through the way you play together.
      </Copy>
      {["The Reader", "The Host", "Good Company"].map((name, i) => (
        <Pressable
          key={name}
          accessibilityRole="button"
          accessibilityLabel={`${name}, ${i === 0 && earned ? (equipped ? "equipped" : "earned") : "locked"}`}
          onPress={() => (i === 0 ? onReader() : onObject(i))}
        >
          <Surface
            style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
          >
            <Collectible index={i} size={72} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 19,
                  fontWeight: "600",
                }}
              >
                {name}
              </Text>
              <Mono style={s.meta}>
                {i === 0 && earned
                  ? equipped
                    ? "Equipped"
                    : "Earned"
                  : "Locked"}
              </Mono>
            </View>
            <Icon
              name={i || !earned ? "lock" : "chevron"}
              color={C.textSecondary}
            />
          </Surface>
        </Pressable>
      ))}
    </>
  );
}
export function PlayerSheet({
  seat,
  equipped,
}: {
  seat: Seat;
  equipped: boolean;
}) {
  return (
    <>
      <View style={{ alignItems: "center", gap: 12 }}>
        <Avatar kind={seat.avatar} size={90} />
        <Text style={{ color: C.textPrimary, fontSize: 24, fontWeight: "600" }}>
          {seat.name}
        </Text>
        <Mono>{money(seat.stackCents)} stack</Mono>
        <Mono style={s.meta}>
          {seat.status ?? "Active"}{" "}
          {seat.positionLabel ? `· ${seat.positionLabel}` : ""}
        </Mono>
      </View>
      {seat.displayContributionCents !== undefined && (
        <Copy>Latest commitment: {money(seat.displayContributionCents)}</Copy>
      )}
      {seat.id === "hero" && (
        <Copy>
          {equipped
            ? "The Reader is equipped on your profile and personal hand dock."
            : "Equip an earned crest from your collection."}
        </Copy>
      )}
      <Copy>Present with The Night Shift</Copy>
    </>
  );
}
const reactions = [
  { id: "nod", label: "Quiet Nod" },
  { id: "wave", label: "Wave" },
  { id: "applause", label: "Applause" },
  { id: "laugh", label: "Friendly laugh" },
];
export function ChatSheet({
  muted,
  onMute,
  onReaction,
  messages,
  onSend,
}: {
  muted: boolean;
  onMute: (v: boolean) => void;
  onReaction: (name: string) => void;
  messages: string[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <>
      {messages.map((message, i) => (
        <Surface key={i}>
          <Copy>{message}</Copy>
        </Surface>
      ))}
      <Copy>
        Notes stay on this device. Opponents at this table are automated.
      </Copy>
      <TextInput
        accessibilityLabel="Message"
        placeholder="Say something kind…"
        placeholderTextColor={C.textMuted}
        value={text}
        onChangeText={setText}
        maxLength={160}
        style={s.input}
      />
      <Button
        label="Send message"
        disabled={!text.trim()}
        onPress={() => {
          onSend(`You: ${text.trim()}`);
          setText("");
        }}
      />
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {reactions.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={r.label}
            onPress={() => onReaction(r.label)}
            style={s.reaction}
          >
            <Icon name={r.id} size={22} />
            <Mono style={{ fontSize: 10 }}>{r.label}</Mono>
          </Pressable>
        ))}
      </View>
      <Toggle label="Mute reactions" value={muted} onChange={onMute} />
    </>
  );
}
const s = StyleSheet.create({
  copy: { color: C.textSecondary, fontSize: 15, lineHeight: 22 },
  meta: { color: C.textSecondary, fontSize: 11, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 16,
    color: C.textPrimary,
    padding: 14,
    fontSize: 16,
    minHeight: 52,
    backgroundColor: C.surface,
  },
  toggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reaction: {
    minHeight: 52,
    padding: 10,
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    alignItems: "center",
    flexBasis: "47%",
  },
});
