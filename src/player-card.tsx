import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Collectible,
  Icon,
  Mono,
  PlayingCard,
} from "./components";
import { money, Seat } from "./game";
import { Entrance, useReducedMotion } from "./motion";
import { C, F } from "./theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Anchor = { x: number; y: number; width: number; height: number };
export function FloatingPlayerCard({
  seat,
  anchor,
  equipped,
  onClose,
  onHistory,
  onJoin,
  onEdit,
}: {
  seat: Seat;
  anchor: Anchor | null;
  equipped: boolean;
  onClose: () => void;
  onHistory?: () => void;
  onJoin?: () => void;
  onEdit?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const cardWidth = Math.min(290, width - 32);
  const [cardHeight, setCardHeight] = useState(
    seat.id === "hero" && (onHistory || onJoin) ? 330 : 218,
  );
  const insets = useSafeAreaInsets();
  const topLimit = Math.max(16, insets.top + 8),
    bottomLimit = Math.max(16, insets.bottom + 8);
  const target = anchor ?? { x: width - 70, y: 28, width: 44, height: 44 };
  const below =
    target.y + target.height + 12 + cardHeight < height - bottomLimit;
  const left = Math.max(
    16,
    Math.min(
      width - cardWidth - 16,
      target.x + target.width / 2 - cardWidth / 2,
    ),
  );
  const top = Math.max(
    topLimit,
    Math.min(
      height - cardHeight - bottomLimit,
      below ? target.y + target.height + 12 : target.y - cardHeight - 12,
    ),
  );
  const pointer = Math.max(
    24,
    Math.min(cardWidth - 24, target.x + target.width / 2 - left),
  );
  return (
    <Modal
      transparent
      visible
      animationType={reduced ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss player card"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: "#05030835" }]}
        />
        <Entrance
          identity={seat.id}
          distance={below ? -6 : 6}
          duration={200}
          style={{ position: "absolute", left, top, width: cardWidth }}
        >
          <View
            testID="floating-player-card"
            onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
            accessibilityLabel={`${seat.name}'s player card`}
            style={{
              padding: 18,
              borderRadius: 24,
              backgroundColor: "#251B30",
              borderWidth: 1,
              borderColor: "#806591",
              shadowColor: "#000",
              shadowOpacity: 0.6,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 14 },
              gap: 14,
            }}
          >
            <View
              style={{
                position: "absolute",
                left: pointer - 6,
                ...(below ? { top: -7 } : { bottom: -7 }),
                width: 12,
                height: 12,
                transform: [{ rotate: "45deg" }],
                backgroundColor: "#251B30",
                borderLeftWidth: below ? 1 : 0,
                borderTopWidth: below ? 1 : 0,
                borderRightWidth: below ? 0 : 1,
                borderBottomWidth: below ? 0 : 1,
                borderColor: "#806591",
              }}
            />
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View>
                <Avatar kind={seat.avatar} size={54} />
                {seat.id === "hero" && equipped && (
                  <View style={{ position: "absolute", bottom: -3, right: -5 }}>
                    <Collectible size={23} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: F.display,
                    fontSize: 28,
                    color: C.textPrimary,
                  }}
                >
                  {seat.name}
                </Text>
                <Text
                  style={{
                    fontFamily: F.body,
                    fontSize: 11,
                    color: C.textSecondary,
                  }}
                >
                  {onJoin
                    ? "Your profile"
                    : seat.id === "hero"
                      ? "Your seat"
                      : "Practice opponent"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close player card"
                onPress={onClose}
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="close" size={17} />
              </Pressable>
            </View>
            {onJoin ? (
              <>
                <Text
                  style={{
                    fontFamily: F.display,
                    fontSize: 26,
                    lineHeight: 29,
                    color: C.accent,
                  }}
                >
                  Your next good hand is waiting.
                </Text>
                <Text
                  style={{
                    fontFamily: F.body,
                    fontSize: 12,
                    lineHeight: 19,
                    color: C.textSecondary,
                  }}
                >
                  Practice chips stay at the table. Settle in whenever you’re
                  ready.
                </Text>
                <Button label="Join table" primary onPress={onJoin} />
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: C.borderSubtle,
                    gap: 16,
                  }}
                >
                  <View style={{ flex: 1, gap: 5 }}>
                    <Mono
                      style={{
                        fontSize: 8,
                        letterSpacing: 1.5,
                        color: C.textSecondary,
                      }}
                    >
                      STACK
                    </Mono>
                    <Mono style={{ fontSize: 19 }}>
                      {money(seat.stackCents)}
                    </Mono>
                  </View>
                  <View style={{ gap: 5, justifyContent: "center" }}>
                    <Mono
                      style={{
                        fontSize: 8,
                        letterSpacing: 1.5,
                        color: C.textSecondary,
                      }}
                    >
                      POSITION
                    </Mono>
                    <Text
                      style={{ fontFamily: F.ui, fontSize: 13, color: C.gold }}
                    >
                      {seat.positionLabel || "At the table"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text
                      style={{
                        fontFamily: F.ui,
                        fontSize: 12,
                        color: seat.winner ? C.positive : C.accent,
                      }}
                    >
                      {seat.winner
                        ? "Won the pot"
                        : seat.status === "folded"
                          ? "Folded this hand"
                          : seat.status === "all-in"
                            ? "All-in"
                            : seat.status === "out"
                              ? "Sitting out"
                              : seat.lastAction || "Ready to play"}
                    </Text>
                    {seat.displayContributionCents !== undefined && (
                      <Text
                        style={{
                          fontFamily: F.body,
                          fontSize: 10,
                          color: C.textSecondary,
                        }}
                      >
                        {money(seat.displayContributionCents)} committed this
                        street
                      </Text>
                    )}
                  </View>
                  {seat.holeCards && (
                    <View style={{ flexDirection: "row", gap: 3 }}>
                      {seat.holeCards.map((card, i) => (
                        <PlayingCard key={i} code={card} width={24} />
                      ))}
                    </View>
                  )}
                </View>
                {seat.id === "hero" && onHistory && (
                  <Button
                    label="Session & hand history"
                    onPress={onHistory}
                    small
                    style={{ minHeight: 44, paddingVertical: 8 }}
                  />
                )}
              </>
            )}
            {seat.id === "hero" && onEdit && (
              <Button
                label="Your seat & profile"
                onPress={onEdit}
                small
                style={{ minHeight: 44, paddingVertical: 8 }}
              />
            )}
          </View>
        </Entrance>
      </View>
    </Modal>
  );
}
