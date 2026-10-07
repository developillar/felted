import React, { useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import {
  Avatar,
  Button,
  Collectible,
  Icon,
  IconButton,
  Mono,
  Wordmark,
} from "./components";
import { Entrance, Float } from "./motion";
import { Anchor } from "./player-card";
import { Atmosphere, CardScene } from "./visuals";
import { C, F } from "./theme";

function Masthead({
  onProfile,
  onSettings,
}: {
  onProfile: (anchor?: Anchor) => void;
  onSettings?: () => void;
}) {
  const profile = useRef<View>(null);
  return (
    <View style={s.masthead}>
      <Wordmark />
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        {onSettings && (
          <IconButton name="menu" label="App settings" onPress={onSettings} />
        )}
        <Pressable
          ref={profile}
          accessibilityRole="button"
          accessibilityLabel="Your profile"
          onPress={() =>
            profile.current?.measureInWindow((x, y, width, height) =>
              onProfile({ x, y, width, height }),
            )
          }
          style={s.profile}
        >
          <Avatar size={39} />
        </Pressable>
      </View>
    </View>
  );
}

export function ClubScreen({
  onJoin,
  onHost,
  onCollection,
  onProfile,
  resume = false,
  playerCount = 6,
  earned = false,
  onLearn,
  onSetup,
  handsPlayed = 0,
  tableName = "The Night Shift",
  onSettings,
}: {
  onJoin: () => void;
  onHost: () => void;
  onCollection: () => void;
  onProfile: (anchor?: Anchor) => void;
  resume?: boolean;
  playerCount?: number;
  earned?: boolean;
  onLearn?: () => void;
  onSetup?: () => void;
  handsPlayed?: number;
  tableName?: string;
  onSettings?: () => void;
}) {
  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      <Atmosphere />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Masthead onProfile={onProfile} onSettings={onSettings} />
        <Entrance identity="home-heading" distance={14} duration={550}>
          <View style={{ alignItems: "center", paddingTop: 20, gap: 12 }}>
            <Mono style={s.eyebrow}>POKER, WITH PERSONALITY</Mono>
            <Text
              accessibilityRole="header"
              style={[
                s.headline,
                {
                  fontSize: width < 380 ? 53 : 58,
                  lineHeight: width < 380 ? 53 : 57,
                },
              ]}
            >
              Good cards.{"\n"}
              <Text style={{ fontFamily: F.italic, color: C.accent }}>
                Great company.
              </Text>
            </Text>
            <Text style={s.intro}>
              A little strategy. A little soul. All yours.
            </Text>
          </View>
        </Entrance>
        <Entrance
          identity="home-cards"
          delay={100}
          distance={15}
          duration={650}
        >
          <CardScene />
        </Entrance>
        <Entrance
          identity="home-table"
          delay={170}
          distance={10}
          duration={480}
        >
          <View style={s.joinCard}>
            <View style={[s.row, { marginBottom: 13 }]}>
              <View style={{ gap: 5, flex: 1 }}>
                <Text numberOfLines={1} style={s.tableName}>
                  {tableName}
                </Text>
                <Text style={s.small}>
                  {playerCount} seats · No-limit Hold’em · Practice
                </Text>
              </View>
              <View style={{ flexDirection: "row", paddingLeft: 12 }}>
                {["cap-skater", "purple-headphones", "fox-glasses"]
                  .slice(0, Math.min(3, playerCount - 1))
                  .map((avatar, i) => (
                    <View
                      key={avatar}
                      style={{
                        marginLeft: i ? -10 : 0,
                        borderWidth: 2,
                        borderColor: "#251A31",
                        borderRadius: 20,
                        backgroundColor: "#30223E",
                      }}
                    >
                      <Avatar kind={avatar} size={28} />
                    </View>
                  ))}
              </View>
            </View>
            <Button
              label={resume ? "Resume table" : "Join table"}
              primary
              onPress={onJoin}
              style={{ minHeight: 52, borderRadius: 14 }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 11,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: C.positive,
                }}
              />
              <Text style={s.saved}>
                {resume
                  ? `${handsPlayed} ${handsPlayed === 1 ? "hand" : "hands"} played · Your seat is saved`
                  : "Play with bots. Settle in at your own pace."}
              </Text>
            </View>
          </View>
        </Entrance>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set up a practice game"
            onPress={onSetup}
            style={({ pressed }) => [
              s.smallTile,
              pressed && { backgroundColor: "#34233F" },
            ]}
          >
            <View style={s.tileIcon}>
              <Icon name="spade" size={19} color={C.accent} />
            </View>
            <Text style={s.tileTitle}>Find your rhythm</Text>
            <Text style={s.small}>Your seats. Your stakes.</Text>
            <View style={s.tileArrow}>
              <Icon name="arrow" size={14} color={C.textSecondary} />
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Host a game"
            onPress={onHost}
            style={({ pressed }) => [
              s.smallTile,
              pressed && { backgroundColor: "#34233F" },
            ]}
          >
            <View style={s.tileIcon}>
              <Icon name="plus" size={19} color={C.gold} />
            </View>
            <Text style={s.tileTitle}>Make it yours</Text>
            <Text style={s.small}>Name a local table.</Text>
            <View style={s.tileArrow}>
              <Icon name="arrow" size={14} color={C.textSecondary} />
            </View>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            earned ? "Club collection, 1 earned" : "Learn the game"
          }
          onPress={earned ? onCollection : onLearn}
          style={s.learnCard}
        >
          <View
            style={{
              width: 62,
              height: 62,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Collectible size={61} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Mono style={[s.eyebrow, { fontSize: 8, letterSpacing: 1.2 }]}>
              {earned ? "YOUR FIRST OBJECT" : "A SHARPER EYE"}
            </Mono>
            <Text
              style={{
                fontFamily: F.display,
                fontSize: 24,
                color: C.textPrimary,
              }}
            >
              {earned ? "The Reader is yours." : "Learn it. Earn it."}
            </Text>
            <Text style={s.small}>
              {earned
                ? "Your collection is taking shape."
                : "A quick lesson. A lasting little object."}
            </Text>
          </View>
          <Icon name="chevron" size={18} color={C.accent} />
        </Pressable>
        <Text style={s.footnote}>
          Real poker rules. Practice chips. No cash value.
        </Text>
      </ScrollView>
    </View>
  );
}

function ObjectStage({ size = 186 }: { size?: number }) {
  return (
    <View
      style={{
        height: size + 46,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View pointerEvents="none" style={{ position: "absolute" }}>
        <Svg width={size + 90} height={size + 80} viewBox="0 0 280 250">
          <Circle cx="140" cy="120" r="94" fill="#38264A" opacity=".5" />
          <Circle
            cx="140"
            cy="120"
            r="92"
            fill="none"
            stroke="#8E6DA4"
            strokeWidth=".7"
            strokeDasharray="2 8"
          />
          <Circle
            cx="140"
            cy="120"
            r="110"
            fill="none"
            stroke="#B796C8"
            strokeOpacity=".15"
            strokeWidth=".7"
          />
          <Path
            d="M42 68h10m-5-5v10M234 160h10m-5-5v10"
            stroke={C.gold}
            strokeWidth="1"
          />
        </Svg>
      </View>
      <Float amplitude={7} duration={5200}>
        <Collectible size={size} />
      </Float>
    </View>
  );
}

export function ReaderScreen({
  equipped,
  onEquip,
  onCollection,
  onClose,
  onInfo,
  earned = false,
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
  return (
    <View style={{ flex: 1 }}>
      <Atmosphere />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      >
        <View style={[s.row, { height: 56, marginHorizontal: -8 }]}>
          <IconButton
            name="back"
            label="Back to collection"
            onPress={onClose}
          />
          <Wordmark />
          <IconButton
            name="spark"
            label="Achievement details"
            onPress={onInfo}
          />
        </View>
        <Entrance identity="reader-heading" distance={16} duration={550}>
          <View style={{ alignItems: "center", paddingTop: 22, gap: 10 }}>
            <Mono style={s.eyebrow}>KNOWLEDGE · OBJECT 001</Mono>
            <Text
              accessibilityRole="header"
              style={[s.headline, { fontSize: 52, lineHeight: 56 }]}
            >
              The Reader.
            </Text>
            <Text style={s.intro}>A sharper eye. A calmer game.</Text>
          </View>
        </Entrance>
        <Entrance identity="reader-object" delay={150} duration={650}>
          <ObjectStage size={height < 740 ? 166 : 210} />
        </Entrance>
        <View style={{ alignItems: "center", gap: 12 }}>
          <View style={s.statusPill}>
            <Icon
              name={earned ? "check" : "lock"}
              size={13}
              color={earned ? C.positive : C.gold}
            />
            <Mono
              style={{
                fontSize: 9,
                color: earned ? C.positive : C.gold,
                letterSpacing: 1.2,
              }}
            >
              {equipped
                ? "EQUIPPED"
                : earned
                  ? "EARNED THROUGH KNOWLEDGE"
                  : "WAITING TO BE EARNED"}
            </Mono>
          </View>
          <Text
            style={[
              s.intro,
              { maxWidth: 290, textAlign: "center", lineHeight: 21 },
            ]}
          >
            {earned
              ? "You know the rhythm. You understand the pots. Carry that confidence to the table."
              : "Learn the rhythm of Hold’em. Solve one side-pot question. Make this little glass spade your own."}
          </Text>
        </View>
        <View
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTopWidth: 1,
            borderColor: C.borderSubtle,
            gap: 15,
          }}
        >
          <View style={[s.row, { gap: 14 }]}>
            <Icon name="spade" color={C.accent} size={24} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{ fontFamily: F.ui, fontSize: 13, color: C.textPrimary }}
              >
                Your personal crest
              </Text>
              <Text style={s.small}>
                A small signature on your seat at the table.
              </Text>
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
            primary={!equipped}
            disabled={equipped}
            onPress={earned ? onEquip : () => onLearn?.()}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View collection"
            onPress={onCollection}
            style={{
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: F.ui, fontSize: 13, color: C.accent }}>
              Back to your collection ↗
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export function CollectionScreen({
  earned,
  equipped,
  onReader,
  onObject,
  onProfile,
  onSettings,
}: {
  earned: boolean;
  equipped: boolean;
  onReader: () => void;
  onObject: (index: number) => void;
  onProfile: (anchor?: Anchor) => void;
  onSettings?: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Atmosphere gold />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Masthead onProfile={onProfile} onSettings={onSettings} />
        <Entrance identity="collection-heading" distance={16} duration={550}>
          <View style={{ paddingTop: 22, paddingBottom: 22, gap: 12 }}>
            <Mono style={s.eyebrow}>THE COLLECTION</Mono>
            <Text
              accessibilityRole="header"
              style={[
                s.headline,
                { textAlign: "left", fontSize: 49, lineHeight: 49 },
              ]}
            >
              Objects with{"\n"}
              <Text style={{ fontFamily: F.italic, color: C.gold }}>
                a little soul.
              </Text>
            </Text>
            <Text style={s.intro}>Small milestones. Made personal.</Text>
          </View>
        </Entrance>
        <Entrance identity="collection-reader" delay={100} duration={500}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`The Reader, ${earned ? (equipped ? "equipped" : "earned") : "locked"}`}
            onPress={onReader}
            style={s.objectFeature}
          >
            <View
              style={[
                s.row,
                {
                  position: "absolute",
                  left: 18,
                  right: 18,
                  top: 16,
                  zIndex: 2,
                },
              ]}
            >
              <Mono
                style={{
                  fontSize: 9,
                  color: C.textSecondary,
                  letterSpacing: 1,
                }}
              >
                001 / KNOWLEDGE
              </Mono>
              <Icon
                name={earned ? "check" : "lock"}
                size={16}
                color={earned ? C.positive : C.gold}
              />
            </View>
            <ObjectStage size={158} />
            <View style={[s.row, { paddingHorizontal: 20, paddingBottom: 19 }]}>
              <View style={{ gap: 5 }}>
                <Text
                  style={{
                    fontFamily: F.display,
                    fontSize: 32,
                    color: C.textPrimary,
                  }}
                >
                  The Reader
                </Text>
                <Text style={s.small}>
                  {earned
                    ? "A sharper eye. A calmer game."
                    : "Your first object is waiting."}
                </Text>
              </View>
              <View style={s.statusPill}>
                <Text
                  style={{
                    fontFamily: F.ui,
                    fontSize: 11,
                    color: earned ? C.positive : C.accent,
                  }}
                >
                  {equipped ? "Equipped" : earned ? "Earned" : "Earn it"}
                </Text>
                <Icon name="arrow" size={14} color={C.accent} />
              </View>
            </View>
          </Pressable>
        </Entrance>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          {["The Host", "Good Company"].map((name, i) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={`${name}, locked`}
              onPress={() => onObject(i + 1)}
              style={s.objectSmall}
            >
              <View style={[s.row, { width: "100%" }]}>
                <Mono style={{ fontSize: 8, color: C.textMuted }}>
                  00{i + 2}
                </Mono>
                <Icon name="lock" size={13} color={C.textMuted} />
              </View>
              <View style={{ opacity: 0.65, marginVertical: 12 }}>
                <Collectible index={i + 1} size={86} />
              </View>
              <Text
                style={{ fontFamily: F.ui, fontSize: 15, color: C.textPrimary }}
              >
                {name}
              </Text>
              <Text
                style={[
                  s.small,
                  { fontSize: 10, marginTop: 5, textAlign: "center" },
                ]}
              >
                Coming with shared play
              </Text>
            </Pressable>
          ))}
        </View>
        <View
          style={{
            alignItems: "center",
            paddingTop: 23,
            paddingBottom: 12,
            gap: 7,
          }}
        >
          <Mono style={{ fontSize: 9, color: C.gold, letterSpacing: 1.5 }}>
            EARNED. NEVER BOUGHT.
          </Mono>
          <Text style={s.small}>
            {earned
              ? "1 of 3 objects earned"
              : "Your story starts with one small lesson."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masthead: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#685078",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22162D",
  },
  eyebrow: { fontSize: 9, letterSpacing: 2.2, color: C.gold },
  headline: {
    fontFamily: F.display,
    color: C.textPrimary,
    textAlign: "center",
  },
  intro: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
  },
  joinCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#6E507E",
    backgroundColor: "#23182E",
    shadowColor: "#A176C0",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  tableName: { fontFamily: F.ui, fontSize: 17, color: C.textPrimary },
  small: {
    fontFamily: F.body,
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 16,
  },
  saved: { fontFamily: F.body, fontSize: 10, color: C.textSecondary },
  smallTile: {
    flex: 1,
    padding: 15,
    gap: 5,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    borderRadius: 20,
    backgroundColor: "#18121F",
    minHeight: 121,
  },
  tileIcon: {
    width: 30,
    height: 30,
    justifyContent: "center",
    marginBottom: 6,
  },
  tileTitle: { fontFamily: F.ui, color: C.textPrimary, fontSize: 14 },
  tileArrow: { position: "absolute", right: 14, top: 16 },
  learnCard: {
    minHeight: 98,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    borderRadius: 20,
    padding: 12,
    backgroundColor: "#191220",
  },
  footnote: {
    fontFamily: F.body,
    color: C.textMuted,
    fontSize: 10,
    textAlign: "center",
    paddingTop: 19,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#79618F",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  objectFeature: {
    backgroundColor: "#271C32",
    borderWidth: 1,
    borderColor: "#6F527F",
    borderRadius: 26,
    paddingTop: 24,
    overflow: "hidden",
  },
  objectSmall: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#191220",
    borderWidth: 1,
    borderColor: C.borderSubtle,
    borderRadius: 22,
    padding: 16,
  },
});
