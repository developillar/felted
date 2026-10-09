import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Collectible, Icon, Mono, Surface } from "./components";
import { Preferences } from "./preferences";
import { C, F } from "./theme";
import { Choice, Eyebrow, Panel, SectionHeading } from "./editorial";
import { TablePreview } from "./setup-preview";

export function Copy({ children }: React.PropsWithChildren) {
  return <Text style={s.copy}>{children}</Text>;
}
export function Toggle({
  label,
  value,
  onChange,
  detail,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detail?: string;
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
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: F.ui, fontSize: 14, color: C.textPrimary }}>
          {label}
        </Text>
        {detail && (
          <Text
            style={{
              fontFamily: F.body,
              fontSize: 11,
              lineHeight: 17,
              color: C.textSecondary,
            }}
          >
            {detail}
          </Text>
        )}
      </View>
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
      <SectionHeading
        title="Make room for your rhythm."
        detail="Your preferences are saved on this device."
      />
      <Panel>
        <Eyebrow>THE ATMOSPHERE</Eyebrow>
        <Toggle
          label="Mute reactions"
          detail="A quieter table, without reaction overlays."
          value={preferences.muted}
          onChange={(muted) => onChange({ muted })}
        />
        <Toggle
          label="Sound"
          detail="Soft card, chip and winning sounds."
          value={preferences.sound}
          onChange={(sound) => onChange({ sound })}
        />
        <Toggle
          label="Haptics"
          detail="A little feedback on supported phones."
          value={preferences.haptics}
          onChange={(haptics) => onChange({ haptics })}
        />
      </Panel>
      <Panel>
        <Eyebrow>YOUR COMFORT</Eyebrow>
        <Toggle
          label="Reduce motion"
          detail="Keep the experience still and steady."
          value={preferences.reducedMotion}
          onChange={(reducedMotion) => onChange({ reducedMotion })}
        />
        <Toggle
          label="Simplified table"
          detail="Replace small seat labels with a readable player list."
          value={preferences.simpleLayout}
          onChange={(simpleLayout) => onChange({ simpleLayout })}
        />
      </Panel>
    </>
  );
}
export function HostSheet({
  onCreate,
  avatar,
  replacing = false,
}: {
  onCreate: (name: string, capacity: number) => void;
  avatar?: string;
  replacing?: boolean;
}) {
  const [name, setName] = useState("The Night Shift"),
    [capacity, setCapacity] = useState(6);
  return (
    <>
      <Eyebrow>A LITTLE PLACE TO CALL YOUR OWN</Eyebrow>
      <SectionHeading
        title="Give the evening a name."
        detail="A personal practice table, with your favorite number of seats."
      />
      <TextInput
        accessibilityLabel="Table name"
        value={name}
        maxLength={48}
        onChangeText={setName}
        style={s.input}
      />
      <View style={{ flexDirection: "row", gap: 6 }}>
        {["The Night Shift", "Sunday Slowdown"].map((preset) => (
          <Choice
            key={preset}
            label={preset}
            selected={name === preset}
            onPress={() => setName(preset)}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      <TablePreview count={capacity} avatar={avatar} />
      <SectionHeading
        title="Bring a little company."
        detail="Seats, including you"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
          <Choice
            key={n}
            label={`${n}`}
            selected={capacity === n}
            onPress={() => setCapacity(n)}
            style={{ minWidth: 52, flexBasis: "22%", flexGrow: 1 }}
          />
        ))}
      </View>
      <Eyebrow>NO-LIMIT HOLD’EM · $0.10 / $0.20</Eyebrow>
      <Copy>
        Play locally with automated opponents and $100 in practice chips each.
        Live invitations are still to come.
      </Copy>
      {replacing && (
        <Copy>
          Creating this table replaces your saved table and its session history.
        </Copy>
      )}
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
      {!messages.length && (
        <Panel style={{ alignItems: "center", paddingVertical: 24 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: "#3A2749",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="chat" color={C.accent} size={26} />
          </View>
          <SectionHeading title="A little warmth at the table." />
          <Text
            style={{
              fontFamily: F.body,
              color: C.textSecondary,
              textAlign: "center",
              fontSize: 12,
              lineHeight: 19,
            }}
          >
            Leave yourself a note, or send a little reaction into your practice
            game.
          </Text>
        </Panel>
      )}
      {messages.map((message, i) => (
        <Surface key={i}>
          <Copy>{message}</Copy>
        </Surface>
      ))}
      <Copy>
        Notes stay on this device. Opponents at this table are automated.
      </Copy>
      <Eyebrow>YOUR TABLE NOTES</Eyebrow>
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
      <SectionHeading title="Say it with a little gesture." />
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
  copy: {
    fontFamily: F.body,
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  meta: { color: C.textSecondary, fontSize: 11, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 16,
    color: C.textPrimary,
    padding: 14,
    fontSize: 16,
    fontFamily: F.body,
    minHeight: 52,
    backgroundColor: C.surface,
  },
  toggle: {
    minHeight: 58,
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
