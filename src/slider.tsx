import React, { useMemo, useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import { C } from "./theme";

export type SliderProps = {
  minimum: number;
  maximum: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
};
export function AmountSlider({
  minimum,
  maximum,
  value,
  onChange,
  label,
}: SliderProps) {
  const track = useRef<View>(null),
    left = useRef(0);
  const [width, setWidth] = useState(300);
  const current = useRef({ minimum, maximum, value, onChange, width });
  current.current = { minimum, maximum, value, onChange, width };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          track.current?.measureInWindow((x) => {
            left.current = x;
          });
          const p = current.current;
          p.onChange(
            Math.round(
              p.minimum +
                (p.maximum - p.minimum) *
                  Math.max(
                    0,
                    Math.min(1, event.nativeEvent.locationX / p.width),
                  ),
            ),
          );
        },
        onPanResponderMove: (_event, gesture) => {
          const p = current.current;
          p.onChange(
            Math.round(
              p.minimum +
                (p.maximum - p.minimum) *
                  Math.max(
                    0,
                    Math.min(1, (gesture.moveX - left.current) / p.width),
                  ),
            ),
          );
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  const fraction =
    maximum === minimum
      ? 1
      : Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
  return (
    <View
      ref={track}
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{
        min: minimum,
        max: maximum,
        now: value,
        text: `$${(value / 100).toFixed(2)}`,
      }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(event) =>
        onChange(
          Math.max(
            minimum,
            Math.min(
              maximum,
              value + (event.nativeEvent.actionName === "increment" ? 20 : -20),
            ),
          ),
        )
      }
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        track.current?.measureInWindow((x) => {
          left.current = x;
        });
      }}
      style={{ height: 44, justifyContent: "center" }}
    >
      <View style={{ height: 5, backgroundColor: "#49345D", borderRadius: 4 }}>
        <View
          style={{
            height: 5,
            width: `${fraction * 100}%`,
            backgroundColor: C.accent,
            borderRadius: 4,
          }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: Math.max(0, (width - 26) * fraction),
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 6,
          borderColor: C.accent,
          backgroundColor: "#F9F1FF",
        }}
      />
    </View>
  );
}
