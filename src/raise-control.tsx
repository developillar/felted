import React, { useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon, Mono, PlayingCard } from "./components";
import {
  DemoState,
  actionOptions,
  money,
  parseAmount,
  validateAmount,
} from "./game";
import { Hand, legalActions, potTotal, validateWager } from "./poker/engine";
import { AmountSlider } from "./slider";
import { Entrance, usePressMotion } from "./motion";
import { C, F } from "./theme";

export function InlineRaise({
  state,
  holeCards,
  onSubmit,
  onCancel,
}: {
  state: Hand | DemoState;
  holeCards?: string[];
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}) {
  const engine = "players" in state;
  const bounds = engine ? legalActions(state, "hero") : actionOptions(state);
  const bet = state.currentBetCents === 0;
  const [input, setInput] = useState((bounds.minimum / 100).toFixed(2));
  const amount = parseAmount(input);
  const error = engine
    ? validateWager(state, "hero", amount)
    : validateAmount(state, amount);
  const pot = engine ? potTotal(state) : state.potCents;
  const motion = usePressMotion();
  const setAmount = (value: number) =>
    setInput(
      (Math.max(bounds.minimum, Math.min(bounds.maximum, value)) / 100).toFixed(
        2,
      ),
    );
  const submitLabel = `${bet ? "Bet" : "Raise to"} ${amount === null ? "—" : money(amount)}`;
  return (
    <Entrance identity="inline-raise" distance={12} duration={260}>
      <View
        testID="inline-raise"
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 22,
          backgroundColor: "#24182E",
          borderWidth: 1,
          borderColor: "#78519B",
          gap: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <View style={{ gap: 3 }}>
            <Mono style={{ fontSize: 9, letterSpacing: 1.5, color: C.accent }}>
              {bet ? "YOUR BET" : "RAISE TO"}
            </Mono>
            <Text
              style={{
                fontFamily: F.body,
                fontSize: 9,
                color: C.textSecondary,
              }}
            >
              Total on this street
            </Text>
          </View>
          {holeCards && (
            <View style={{ flexDirection: "row", gap: 2 }}>
              {holeCards.map((card, i) => (
                <PlayingCard key={i} code={card} width={23} />
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: F.display,
                fontSize: 31,
                color: C.textPrimary,
              }}
            >
              $
            </Text>
            <TextInput
              accessibilityLabel={bet ? "Bet amount" : "Raise total amount"}
              keyboardType="decimal-pad"
              value={input}
              onChangeText={setInput}
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={{
                fontFamily: F.display,
                fontSize: 31,
                color: C.textPrimary,
                width: 88,
                textAlign: "right",
                minHeight: 44,
                padding: 0,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel raise"
            onPress={onCancel}
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" size={16} color={C.textSecondary} />
          </Pressable>
        </View>
        <View>
          <AmountSlider
            label={bet ? "Bet amount slider" : "Raise amount slider"}
            minimum={bounds.minimum}
            maximum={bounds.maximum}
            value={Math.max(
              bounds.minimum,
              Math.min(bounds.maximum, amount ?? bounds.minimum),
            )}
            onChange={setAmount}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Mono style={{ fontSize: 8, color: C.textSecondary }}>
              {money(bounds.minimum)}
            </Mono>
            <Mono style={{ fontSize: 8, color: C.textSecondary }}>
              {money(bounds.maximum)}
            </Mono>
          </View>
        </View>
        {error && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ fontFamily: F.body, fontSize: 11, color: C.error }}
          >
            {error}
          </Text>
        )}
        <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
          {[
            ["Minimum", bounds.minimum],
            [
              "½ pot",
              state.currentBetCents + Math.round((pot + bounds.owed) / 2),
            ],
            ["Pot", state.currentBetCents + pot + bounds.owed],
            ["All-in", bounds.maximum],
          ].map(([label, value]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={String(label)}
              onPress={() => {
                Keyboard.dismiss();
                setAmount(Number(value));
              }}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 44,
                minHeight: 48,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 11,
                backgroundColor: pressed ? "#634270" : "#382440",
              })}
            >
              <Text
                style={{
                  fontFamily: F.ui,
                  color: label === "All-in" ? C.gold : C.textPrimary,
                  fontSize: 10,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            accessibilityState={{ disabled: !!error }}
            disabled={!!error}
            onPress={() => amount !== null && onSubmit(amount)}
            onPressIn={motion.onPressIn}
            onPressOut={motion.onPressOut}
            style={{
              flex: 1.8,
              minHeight: 48,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: C.accent,
              opacity: error ? 0.4 : 1,
            }}
          >
            <Animated.View
              style={[motion.style, { alignItems: "center", gap: 1 }]}
            >
              <Text
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.textOnAccent,
                }}
              >
                {bet ? "Bet" : "Raise to"}
              </Text>
              <Text
                style={{
                  fontFamily: F.strong,
                  fontSize: 15,
                  color: C.textOnAccent,
                }}
              >
                {amount === null ? "—" : money(amount)}
              </Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Entrance>
  );
}
