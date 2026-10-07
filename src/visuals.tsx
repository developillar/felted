import React, { useEffect, useId, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { PlayingCard } from "./components";
import { Float, Pulse, useReducedMotion } from "./motion";
import { C, F } from "./theme";

export function StreetMoment({
  street,
  hand,
}: {
  street?: string;
  hand?: number;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!street || reduced) {
      progress.setValue(0);
      return;
    }
    progress.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1050),
      Animated.timing(progress, {
        toValue: 0,
        duration: 650,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [street, hand, reduced]);
  const title = (
    {
      preflop: "The deal.",
      flop: "The flop.",
      turn: "The turn.",
      river: "The river.",
      showdown: "The reveal.",
    } as Record<string, string>
  )[street ?? ""];
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 25,
        left: 77,
        right: 77,
        alignItems: "center",
        gap: 3,
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      <Text style={{ fontFamily: F.italic, fontSize: 26, color: C.accent }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: F.body,
          fontSize: 9,
          color: C.textSecondary,
          letterSpacing: 0.7,
        }}
      >
        {street === "preflop"
          ? "TWO CARDS. YOUR MOVE."
          : street === "showdown"
            ? "LET THE CARDS SPEAK."
            : "A NEW CARD. A NEW POSSIBILITY."}
      </Text>
    </Animated.View>
  );
}

export function PayoutFlight({
  complete,
  hand,
  start,
  end,
}: {
  complete: boolean;
  hand?: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!complete || reduced) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      delay: 250,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [complete, hand, reduced]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 6,
        opacity: progress.interpolate({
          inputRange: [0, 0.1, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        }),
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [start.x, end.x],
            }),
          },
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [start.y, end.y],
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.6, 1.2, 0.8],
            }),
          },
        ],
      }}
    >
      <Chip size={25} gold />
      <View style={{ position: "absolute", left: 14, top: 6 }}>
        <Chip size={23} />
      </View>
      <View style={{ position: "absolute", left: 4, top: -10 }}>
        <Chip size={20} gold />
      </View>
    </Animated.View>
  );
}

export function Atmosphere({ gold = false }: { gold?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 390 700"
      >
        <Defs>
          <RadialGradient id={id} cx="75%" cy="25%" rx="85%" ry="65%">
            <Stop
              offset="0"
              stopColor={gold ? "#826040" : "#634179"}
              stopOpacity="0.42"
            />
            <Stop offset="0.65" stopColor="#251A32" stopOpacity="0.2" />
            <Stop offset="1" stopColor={C.canvas} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="390" height="700" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function Chip({
  size = 24,
  gold = false,
}: {
  size?: number;
  gold?: boolean;
}) {
  const color = gold ? C.gold : C.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <Circle cx="20" cy="22" r="18" fill="#07050C" opacity="0.6" />
      <Circle
        cx="20"
        cy="19"
        r="18"
        fill={gold ? "#805D39" : "#705193"}
        stroke={color}
        strokeWidth="1"
      />
      <Circle
        cx="20"
        cy="19"
        r="15"
        stroke={color}
        strokeWidth="4"
        strokeDasharray="6 7"
        fill="none"
      />
      <Circle
        cx="20"
        cy="19"
        r="10"
        fill={gold ? "#B8925E" : "#A78ACE"}
        stroke={color}
        strokeWidth="1"
      />
      <Path
        d="M20 11c-2 3-7 5-7 8a4 4 0 0 0 7 2 4 4 0 0 0 7-2c0-3-5-5-7-8Zm0 10-3 5h6Z"
        fill={gold ? "#38291A" : "#3A2456"}
      />
    </Svg>
  );
}

export function CardScene() {
  return (
    <View
      pointerEvents="none"
      style={{ height: 156, alignItems: "center", justifyContent: "center" }}
    >
      <Pulse style={{ position: "absolute", width: 230, height: 95, top: 30 }}>
        <Svg width="230" height="95">
          <Defs>
            <RadialGradient id="lobby-halo">
              <Stop offset="0" stopColor="#B38BDC" stopOpacity="0.5" />
              <Stop offset="1" stopColor="#B38BDC" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx="115" cy="48" rx="115" ry="48" fill="url(#lobby-halo)" />
        </Svg>
      </Pulse>
      <View
        style={{
          position: "absolute",
          width: 280,
          height: 70,
          top: 64,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: "#6E51772E",
          transform: [{ rotate: "-15deg" }],
        }}
      />
      <Float
        amplitude={6}
        style={{
          position: "absolute",
          top: 9,
          left: "31%",
          transform: [{ rotate: "-18deg" }],
        }}
      >
        <PlayingCard code="As" width={78} rotation={-18} />
      </Float>
      <Float
        amplitude={8}
        duration={5200}
        style={{ position: "absolute", top: 5, left: "48%" }}
      >
        <PlayingCard code="Ah" width={78} rotation={13} />
      </Float>
      <Float
        amplitude={4}
        duration={4100}
        style={{ position: "absolute", left: "23%", top: 101 }}
      >
        <Chip size={37} gold />
      </Float>
      <Float
        amplitude={6}
        duration={6100}
        style={{ position: "absolute", left: "67%", top: 80 }}
      >
        <Chip size={30} />
      </Float>
      <View style={{ position: "absolute", top: 23, right: "20%" }}>
        <Svg width="12" height="12">
          <Path
            d="M6 0 7.5 4.5 12 6 7.5 7.5 6 12 4.5 7.5 0 6 4.5 4.5Z"
            fill={C.gold}
          />
        </Svg>
      </View>
    </View>
  );
}

export function FeltSurface({
  width,
  height,
  complete = false,
}: {
  width: number;
  height: number;
  complete?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const x = width / 2,
    y = height / 2;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <RadialGradient id={`${id}-felt`} cx="50%" cy="45%" rx="55%" ry="58%">
            <Stop offset="0" stopColor={complete ? "#423247" : "#40304F"} />
            <Stop offset="0.65" stopColor="#241A30" />
            <Stop offset="1" stopColor="#120E1B" />
          </RadialGradient>
          <Pattern
            id={`${id}-grain`}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <Circle cx="1" cy="1" r="0.4" fill="#EBCEFF" opacity="0.04" />
            <Line
              x1="4"
              y1="4"
              x2="6"
              y2="5"
              stroke="#09060E"
              strokeWidth="0.6"
              opacity="0.6"
            />
          </Pattern>
        </Defs>
        <Ellipse
          cx={x}
          cy={y}
          rx={x - 18}
          ry={y - 6}
          fill="#0D0A14"
          stroke="#534064"
          strokeWidth="2"
        />
        <Ellipse
          cx={x}
          cy={y}
          rx={x - 25}
          ry={y - 13}
          fill={`url(#${id}-felt)`}
          stroke="#A284AE"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
        <Ellipse
          cx={x}
          cy={y}
          rx={x - 25}
          ry={y - 13}
          fill={`url(#${id}-grain)`}
        />
        <Ellipse
          cx={x}
          cy={y}
          rx={x - 35}
          ry={y - 23}
          fill="none"
          stroke={complete ? C.gold : "#9D7CB4"}
          strokeOpacity="0.22"
          strokeWidth="1"
          strokeDasharray="1 4"
        />
        <G
          opacity="0.08"
          transform={`translate(${x - 14} ${y + 83}) scale(1.2)`}
        >
          <Path
            d="M12 2C8 7 2 10 2 15a6 6 0 0 0 10 3 6 6 0 0 0 10-3c0-5-6-8-10-13Zm0 16-4 7h8Z"
            fill={C.accent}
          />
        </G>
      </Svg>
    </View>
  );
}

export function WagerFlight({
  pot,
  hand,
  actor,
  start,
  end,
}: {
  pot: number;
  hand?: number;
  actor?: string | null;
  start: { x: number; y: number };
  end: { x: number; y: number };
}) {
  const reduced = useReducedMotion();
  const previous = useRef({ pot, hand, actor, start });
  const [source, setSource] = useState(start);
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const before = previous.current;
    previous.current = { pot, hand, actor, start };
    if (reduced || before.hand !== hand || pot <= before.pot) return;
    setSource(before.start);
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [pot, hand, actor, reduced]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 5,
        opacity: progress.interpolate({
          inputRange: [0, 0.1, 0.7, 1],
          outputRange: [0, 1, 1, 0],
        }),
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [source.x, end.x],
            }),
          },
          {
            translateY: progress.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [source.y, (source.y + end.y) / 2 - 30, end.y],
            }),
          },
          {
            rotate: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["-25deg", "20deg"],
            }),
          },
        ],
      }}
    >
      <Chip size={22} />
      <View style={{ position: "absolute", left: 11, top: 7 }}>
        <Chip size={20} gold />
      </View>
    </Animated.View>
  );
}

export function VictorySpark({ identity }: { identity: string }) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [identity, reduced]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "45%",
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: i % 2 ? C.accent : C.gold,
              opacity: progress.interpolate({
                inputRange: [0, 0.15, 0.6, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(angle) * 115],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(angle) * 90],
                  }),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.5, 0.3],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
