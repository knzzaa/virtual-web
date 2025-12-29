import React, { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Sparkle = {
  xPct: number;
  yPct: number;
  size: number;
  delay: number;
  drift: number;
  blur: number;
};

type Props = {
  /** Number of sparkles (keep small for perf). */
  count?: number;
};

function YellowSparklesBase({ count = 14 }: Props) {
  const sparkles = useMemo<Sparkle[]>(() => {
    // Deterministic-ish layout.
    const arr: Sparkle[] = [];
    for (let i = 0; i < count; i++) {
      const seed = (i * 97) % 101;
      arr.push({
        xPct: ((seed * 73) % 100) / 100,
        yPct: ((seed * 41) % 100) / 100,
        size: 6 + ((seed * 19) % 18),
        delay: (seed % 8) * 220,
        drift: 10 + ((seed * 7) % 22),
        blur: 10 + ((seed * 11) % 22),
      });
    }
    return arr;
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sparkles.map((s, idx) => (
        <SparkleDot key={idx} s={s} />
      ))}
    </View>
  );
}

function SparkleDot({ s }: { s: Sparkle }) {
  const p = useSharedValue(0);
  const tw = useSharedValue(0);

  React.useEffect(() => {
    p.value = withRepeat(
      withDelay(s.delay, withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) })),
      -1,
      true
    );
    tw.value = withRepeat(
      withTiming(1, { duration: 1600 + s.delay, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [p, tw, s.delay]);

  const style = useAnimatedStyle(() => {
    const dx = interpolate(p.value, [0, 1], [-s.drift, s.drift]);
    const dy = interpolate(p.value, [0, 1], [s.drift, -s.drift]);
    const opacity = interpolate(tw.value, [0, 1], [0.08, 0.42]);
    const scale = interpolate(tw.value, [0, 1], [0.85, 1.25]);

    return {
      opacity,
      transform: [{ translateX: dx }, { translateY: dy }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: s.size,
          height: s.size,
          borderRadius: s.size / 2,
          left: `${s.xPct * 100}%`,
          top: `${s.yPct * 100}%`,
          shadowRadius: s.blur,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255, 214, 102, 0.95)",
    shadowColor: "rgba(255, 214, 102, 1)",
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default memo(YellowSparklesBase);
