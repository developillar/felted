import React, { useState } from "react";
import { Text, View } from "react-native";
import { Avatar, Icon } from "./components";
import { C, F } from "./theme";
import { FeltSurface } from "./visuals";

const opponents = [
  "cloth-ghost",
  "fox-glasses",
  "purple-headphones",
  "cap-skater",
  "rabbit",
  "frog-knit",
  "helmet",
  "cap-skater",
];
export function TablePreview({
  count,
  avatar = "black-cat-knit",
}: {
  count: number;
  avatar?: string;
}) {
  const [width, setWidth] = useState(295);
  return (
    <View
      accessible
      accessibilityLabel={`Table preview: you and ${count - 1} automated ${count === 2 ? "opponent" : "opponents"}`}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: 154, marginVertical: 3 }}
    >
      <FeltSurface width={width} height={154} />
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Icon name="spade" size={16} color={C.gold} />
        <Text
          style={{ fontFamily: F.display, color: C.textPrimary, fontSize: 28 }}
        >
          {count} seats.
        </Text>
        <Text
          style={{ fontFamily: F.body, fontSize: 9, color: C.textSecondary }}
        >
          ONE GOOD TABLE
        </Text>
      </View>
      {Array.from({ length: count }, (_, i) => {
        const angle = Math.PI / 2 + (i * Math.PI * 2) / count;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: width / 2 + Math.cos(angle) * width * 0.39 - 17,
              top: 77 + Math.sin(angle) * 57 - 17,
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: i ? "#755985" : C.accent,
              backgroundColor: "#372544",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar kind={i === 0 ? avatar : opponents[i - 1]} size={31} />
            {i === 0 && (
              <View
                style={{
                  position: "absolute",
                  bottom: -3,
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: C.gold,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
