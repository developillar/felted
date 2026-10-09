import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { Session } from "./session";
import { C, F } from "../theme";

export function SessionChart({ session }: { session: Session }) {
  const [width, setWidth] = useState(280);
  const entries = [...session.history].reverse();
  const values = [
    ...(session.handsPlayed === entries.length ? [0] : []),
    ...entries.map((entry) => entry.netCents),
  ];
  if (!values.length) return null;
  const min = Math.min(0, ...values),
    max = Math.max(0, ...values),
    spread = max - min || 1;
  const points = values.map((value, i) => ({
    x: 7 + (i / Math.max(1, values.length - 1)) * (width - 14),
    y: max === min ? 40 : 9 + ((max - value) / spread) * 62,
  }));
  const path = points
    .map((point, i) => `${i ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");
  const last = points[points.length - 1]!;
  const color = values[values.length - 1]! >= 0 ? C.positive : C.gold;
  return (
    <View
      accessibilityLabel={`Completed-hand session trend across ${entries.length} saved hands`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: 3 }}
    >
      <Svg width={width} height={82} viewBox={`0 0 ${width} 82`} aria-hidden>
        <Defs>
          <LinearGradient id="session-fill" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity=".22" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M7 ${max === min ? 40 : 9 + (max / spread) * 62}H${width - 7}`}
          stroke="#735A86"
          strokeWidth=".7"
          strokeDasharray="3 5"
        />
        <Path
          d={`${path} L${last.x},81 L${points[0]!.x},81 Z`}
          fill="url(#session-fill)"
        />
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={last.x} cy={last.y} r="3.5" fill={color} />
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: F.body, color: C.textMuted, fontSize: 10 }}>
          {session.handsPlayed === entries.length
            ? "First deal"
            : `Hand #${entries[0]!.number}`}
        </Text>
        <Text style={{ fontFamily: F.body, color: C.textMuted, fontSize: 10 }}>
          Latest completed hand
        </Text>
      </View>
    </View>
  );
}
