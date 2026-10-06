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
