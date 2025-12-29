import React, { memo, useEffect, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Flake = {
  xPct: number;
  size: number;
  speed: number;
  delay: number;
  sway: number;
  rotate: number;
  opacity: number;
};

type Props = {
  /** Number of flakes (keep reasonable for perf). */
  count?: number;
  /** Multiplies fall speed (higher = faster). */
  speedMultiplier?: number;
  /** Multiplies flake size (higher = bigger). */
  sizeMultiplier?: number;
};

const FLAKE = require("../../assets/img/Snowflake.png");

function SnowflakesBackgroundBase({ count = 22, speedMultiplier = 1, sizeMultiplier = 1 }: Props) {
  const flakes = useMemo<Flake[]>(() => {
    const arr: Flake[] = [];
    for (let i = 0; i < count; i++) {
      const seed = (i * 97 + 31) % 101;
      const baseSize = 14 + ((seed * 19) % 28); // 14..41 (bigger than before)
      arr.push({
        xPct: ((seed * 73) % 100) / 100,
        size: baseSize * Math.max(0.5, sizeMultiplier),
        speed: (7000 + ((seed * 37) % 5200)) / Math.max(0.25, speedMultiplier),
        delay: (seed % 10) * 220,
        sway: 10 + ((seed * 13) % 26),
        rotate: -18 + ((seed * 9) % 36),
        opacity: 0.20 + ((seed * 7) % 40) / 100, // 0.20..0.60
      });
    }
    return arr;
  }, [count, sizeMultiplier, speedMultiplier]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flakes.map((f, idx) => (
        <Snowflake key={idx} f={f} />
      ))}
    </View>
  );
}

function Snowflake({ f }: { f: Flake }) {
  const p = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    // Fall
    p.value = withRepeat(
      withDelay(f.delay, withTiming(1, { duration: f.speed, easing: Easing.linear })),
      -1,
      false
    );
    // Side sway
    sway.value = withRepeat(
      withDelay(f.delay, withTiming(1, { duration: 2400 + f.delay, easing: Easing.inOut(Easing.quad) })),
      -1,
      true
    );
  }, [p, sway, f.delay, f.speed]);

  const style = useAnimatedStyle(() => {
    const y = interpolate(p.value, [0, 1], [-120, 820]);
    const x = interpolate(sway.value, [0, 1], [-f.sway, f.sway]);
    const rot = f.rotate + interpolate(sway.value, [0, 1], [-10, 10]);
    const op = f.opacity * interpolate(sway.value, [0, 1], [0.75, 1]);
    return {
      opacity: op,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.flake, { left: `${f.xPct * 100}%` }, style]}>
      <Image source={FLAKE} style={{ width: f.size, height: f.size, resizeMode: "contain" }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flake: {
    position: "absolute",
    top: 0,
  },
});

export default memo(SnowflakesBackgroundBase);
