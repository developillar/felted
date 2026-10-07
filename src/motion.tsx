import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Animated, Easing, ViewStyle } from "react-native";

const MotionContext = createContext(false);
export const MotionProvider = MotionContext.Provider;
export function useReducedMotion() {
  return useContext(MotionContext);
}

/** One short entrance per identity change. Layout and accepted game state remain immediate. */
export function Entrance({
  children,
  identity,
  delay = 0,
  distance = 8,
  duration = 220,
  style,
}: PropsWithChildren<{
  identity?: string | number;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: ViewStyle;
}>) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [identity, reduced, progress, delay, duration]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.25, 1],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function usePressMotion() {
  const reduced = useReducedMotion(),
    scale = useRef(new Animated.Value(1)).current;
  const animate = (value: number, duration: number) => {
    scale.stopAnimation();
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.timing(scale, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  return {
    style: { transform: [{ scale }] },
    onPressIn: () => animate(0.975, 80),
    onPressOut: () => animate(1, 120),
  };
}

/** A physical reveal: cards travel onto the felt and settle face-up. */
export function CardReveal({
  children,
  identity,
  delay = 0,
  animate = true,
}: PropsWithChildren<{
  identity: string;
  delay?: number;
  animate?: boolean;
}>) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduced || !animate) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 480,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [identity, reduced, animate, delay, progress]);
  return (
    <Animated.View
      style={{
        opacity: progress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [
          { perspective: 700 },
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-28, 0],
            }),
          },
          {
            rotateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["-82deg", "0deg"],
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.86, 1],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function Float({
  children,
  amplitude = 5,
  duration = 4500,
  style,
}: PropsWithChildren<{
  amplitude?: number;
  duration?: number;
  style?: ViewStyle;
}>) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (reduced) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [reduced, duration, progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -amplitude],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Pulse({
  children,
  active = true,
  style,
}: PropsWithChildren<{ active?: boolean; style?: ViewStyle }>) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (reduced || !active) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, reduced, progress]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.75],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.06],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
