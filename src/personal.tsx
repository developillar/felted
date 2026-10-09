import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Collectible,
  Icon,
  IconButton,
  Wordmark,
} from "./components";
import { Eyebrow, MenuRow, Metric, Panel, SectionHeading } from "./editorial";
import { Entrance, Float } from "./motion";
import { money } from "./money";
import { Profile, portraits } from "./profile";
import { Session } from "./poker/session";
import { C, F } from "./theme";
import { Atmosphere } from "./visuals";

export function PersonalScreen({
  profile,
  session,
  equipped,
  learned,
  onEdit,
  onJoin,
  onHistory,
  onLearn,
  onSettings,
  onCollection,
}: {
  profile: Profile;
  session: Session | null;
  equipped: boolean;
  learned: boolean;
  onEdit: () => void;
  onJoin: () => void;
  onHistory: (handNumber?: number) => void;
  onLearn: () => void;
  onSettings: () => void;
  onCollection: () => void;
}) {
  const hero = session?.hand.players.find((p) => p.id === "hero");
  const net =
    hero && session
      ? hero.stackCents + hero.committedCents - session.startingStackCents
      : 0;
  return (
    <View style={{ flex: 1 }}>
      <Atmosphere gold />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 24,
          gap: 18,
        }}
      >
        <View style={s.header}>
          <Wordmark />
          <IconButton
            name="settings"
            label="App settings"
            onPress={onSettings}
          />
        </View>
        <Entrance identity="personal-seat" distance={14} duration={500}>
          <View style={{ alignItems: "center", paddingTop: 8, gap: 8 }}>
            <Eyebrow>YOUR LITTLE CORNER OF THE TABLE</Eyebrow>
            <Float amplitude={3}>
              <View
                style={[
                  s.portrait,
                  { width: 94, height: 94, borderRadius: 47 },
                ]}
              >
                <Avatar kind={profile.avatar} size={82} />
                {equipped && (
                  <View style={{ position: "absolute", right: -4, bottom: -4 }}>
                    <Collectible size={34} />
                  </View>
                )}
              </View>
            </Float>
            <Text accessibilityRole="header" numberOfLines={2} style={s.name}>
              {profile.name === "You"
                ? "Make yourself at home."
                : `${profile.name}’s seat.`}
            </Text>
            <Text style={s.copy}>A little personality goes a long way.</Text>
            <Button
              label="Edit your profile"
              onPress={onEdit}
              small
              style={{ minWidth: 170 }}
            />
          </View>
        </Entrance>
        <Panel>
          <Eyebrow>{session ? "THIS SESSION" : "YOUR FIRST SESSION"}</Eyebrow>
          {session ? (
            <>
              <SectionHeading title={session.hand.tableName} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Metric label="Hands played" value={session.handsPlayed} />
                <Metric label="Pots won" value={session.handsWon} />
                <Metric
                  label="Net chips"
                  value={`${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`}
                  positive={net > 0}
                />
              </View>
              <Button label="Resume table" onPress={onJoin} primary />
              <MenuRow
                title="Session & hand history"
                detail="Your cards, your decisions, your story."
                icon="history"
                onPress={() => onHistory()}
              />
            </>
          ) : (
            <>
              <SectionHeading
                title="Every story starts with a hand."
                detail="Your session, winnings and completed hands will live here. Practice chips. Your own pace."
              />
              <Button label="Join table" primary onPress={onJoin} />
            </>
          )}
        </Panel>
        {session && session.history.length > 0 && (
          <View style={{ gap: 8 }}>
            <SectionHeading title="The last few hands." />
            {session.history.slice(0, 3).map((entry) => (
              <MenuRow
                key={entry.number}
                title={`Hand #${entry.number} · ${money(entry.potCents)} pot`}
                detail={entry.summary}
                icon="spade"
                onPress={() => onHistory(entry.number)}
                label={`Open history for hand #${entry.number}`}
              />
            ))}
          </View>
        )}
        <View style={{ gap: 3 }}>
          <MenuRow
            title={learned ? "Your collection" : "A sharper eye"}
            detail={
              learned
                ? "The Reader is yours. Give your seat a signature."
                : "Learn the rules. Earn your first object."
            }
            icon={learned ? "collection" : "book"}
            onPress={learned ? onCollection : onLearn}
          />
          <MenuRow
            title="Your preferences"
            detail="Sound, motion, and the way you settle in."
            icon="settings"
            onPress={onSettings}
          />
        </View>
        <Text style={[s.copy, { textAlign: "center", fontSize: 11 }]}>
          Saved on this device. Made for your next good hand.
        </Text>
      </ScrollView>
    </View>
  );
}

export function ProfileEditor({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (value: Profile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  return (
    <>
      <View style={{ alignItems: "center", gap: 12, paddingVertical: 12 }}>
        <View style={s.portrait}>
          <Avatar kind={avatar} size={94} />
        </View>
        <Text
          style={{ fontFamily: F.display, color: C.textPrimary, fontSize: 30 }}
        >
          {name.trim() || "Your seat"}
        </Text>
      </View>
      <SectionHeading
        title="What should we call you?"
        detail="Your name and portrait appear at your practice table."
      />
      <TextInput
        accessibilityLabel="Your name"
        value={name}
        onChangeText={setName}
        maxLength={24}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={s.input}
      />
      <Eyebrow>CHOOSE YOUR PORTRAIT</Eyebrow>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {portraits.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${p.name} portrait`}
            accessibilityState={{ selected: avatar === p.id }}
            onPress={() => setAvatar(p.id)}
            style={[
              s.avatarChoice,
              avatar === p.id && {
                borderColor: C.accent,
                backgroundColor: "#3D2A4D",
              },
            ]}
          >
            <Avatar kind={p.id} size={48} />
            <Text
              style={{
                fontFamily: F.body,
                color: avatar === p.id ? C.accent : C.textSecondary,
                fontSize: 9,
              }}
            >
              {p.name}
            </Text>
            {avatar === p.id && (
              <View style={{ position: "absolute", right: 3, top: 3 }}>
                <Icon name="check" size={12} color={C.accent} />
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Button
        label="Save profile"
        primary
        disabled={!name.trim()}
        onPress={() => onSave({ name: name.trim(), avatar })}
      />
      <Text style={s.copy}>
        Your current cards, chips and hand history stay with you.
      </Text>
    </>
  );
}

const s = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portrait: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "#AF89CA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#382445",
    shadowColor: C.accent,
    shadowOpacity: 0.15,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  name: {
    fontFamily: F.display,
    color: C.textPrimary,
    fontSize: 39,
    lineHeight: 42,
    textAlign: "center",
  },
  copy: {
    fontFamily: F.body,
    fontSize: 12,
    lineHeight: 19,
    color: C.textSecondary,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: C.borderStrong,
    backgroundColor: C.surface,
    borderRadius: 15,
    padding: 14,
    fontSize: 17,
    fontFamily: F.ui,
    color: C.textPrimary,
  },
  avatarChoice: {
    flexBasis: "22%",
    flexGrow: 1,
    minHeight: 84,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
