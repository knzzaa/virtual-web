import React, { memo, useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  /** Runs entrance animation when mounted. */
  autoplay?: boolean;
};

const BEAR = require("../../assets/img/bear.png");

const PURPLE = "rgba(88, 28, 135, 1)";

function WelcomeBearHeroBase({ autoplay = true }: Props) {
  // 0..1 timeline
  const t = useSharedValue(0);

  useEffect(() => {
    if (!autoplay) return;
    // Sequence like the reference:
    // 1) Bear appears small in the circle
    // 2) Bear grows
    // 3) Bear lifts up (as if becoming the badge/top icon)
    t.value = withSequence(
      withTiming(0, { duration: 80 }),
      withDelay(80, withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) }))
    );
  }, [autoplay, t]);

  const brandStyle = useAnimatedStyle(() => {
    // Brand starts centered inside the circle, then becomes prominent.
    const opacity = interpolate(t.value, [0, 0.25, 1], [0.25, 0.85, 1]);
    const y = interpolate(t.value, [0, 1], [14, 0]);
    return { opacity, transform: [{ translateY: y }] };
  });

  const circleStyle = useAnimatedStyle(() => {
    const scale = interpolate(t.value, [0, 0.45, 1], [0.98, 1.0, 1.0]);
    const opacity = interpolate(t.value, [0, 1], [0.75, 1]);
    return { opacity, transform: [{ scale }] };
  });

  const heroBearStyle = useAnimatedStyle(() => {
    // Small -> big -> move up
    const opacity = interpolate(t.value, [0, 0.08, 1], [0, 1, 1]);
    const scale = interpolate(t.value, [0, 0.55, 1], [0.42, 1.0, 0.86]);
    const y = interpolate(t.value, [0, 0.70, 1], [18, 0, -92]);
    return {
      opacity,
      transform: [{ translateY: y }, { scale }],
    };
  });

  const topBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 0.72, 1], [0, 0.0, 1]);
    const y = interpolate(t.value, [0, 1], [-118, -128]);
    const scale = interpolate(t.value, [0, 1], [0.9, 1]);
    return { opacity, transform: [{ translateY: y }, { scale }] };
  });

  const bears = useMemo(
    () => [
      // Smaller, cleaner burst from the center of the circle.
      { key: "b1", x: -62, y: -44, s: 0.20, d: 160 },
      { key: "b2", x: 66, y: -38, s: 0.18, d: 260 },
      { key: "b3", x: -78, y: 24, s: 0.17, d: 340 },
      { key: "b4", x: 74, y: 30, s: 0.16, d: 420 },
      { key: "b5", x: 0, y: 66, s: 0.15, d: 520 },
    ],
    []
  );

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        <Animated.View style={[styles.circle, circleStyle]}>
          <Animated.View style={brandStyle}>
            <Text style={styles.brandBig}>
              <Text style={styles.brandEmph}>ENGLISH</Text>
              <Text style={styles.brandRest}>LAB</Text>
            </Text>
          </Animated.View>

          {/* Burst bears from the circle center */}
          <View style={styles.bearsLayer} pointerEvents="none">
            {bears.map((b) => (
              <SmallBear key={b.key} x={b.x} y={b.y} scale={b.s} delay={b.d} />
            ))}
          </View>

          {/* Main bear that grows then lifts */}
          <Animated.View style={[styles.heroBearWrap, heroBearStyle]} pointerEvents="none">
            <ShineGlow size={170} />
            <Image source={BEAR} style={styles.heroBear} />
          </Animated.View>
        </Animated.View>

        {/* Top badge bear (the "hat" circle) */}
        <Animated.View style={[styles.topBadge, topBadgeStyle]} pointerEvents="none">
          <View style={styles.topBadgeCircle}>
            <ShineGlow size={92} />
            <Image source={BEAR} style={styles.topBadgeBear} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function ShineGlow({ size }: { size: number }) {
  return (
    <View pointerEvents="none" style={[styles.glowWrap, { width: size, height: size }]}>
      {/* Rays (more like "shine" than a bubble) */}
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.00)", "rgba(196, 181, 253, 0.55)", "rgba(196, 181, 253, 0.00)"]}
        start={{ x: 0.0, y: 0.5 }}
        end={{ x: 1.0, y: 0.5 }}
        style={[styles.ray, { width: size * 1.25, height: size * 0.22 }]}
      />
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.00)", "rgba(167, 139, 250, 0.42)", "rgba(196, 181, 253, 0.00)"]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={[styles.ray, styles.rayVertical, { width: size * 0.22, height: size * 1.18 }]}
      />
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.00)", "rgba(167, 139, 250, 0.28)", "rgba(196, 181, 253, 0.00)"]}
        start={{ x: 0.0, y: 0.5 }}
        end={{ x: 1.0, y: 0.5 }}
        style={[styles.ray, { width: size * 1.05, height: size * 0.16, transform: [{ rotate: "-22deg" }] }]}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: 999,
          backgroundColor: "rgba(167, 139, 250, 0.28)",
          shadowColor: "rgba(167, 139, 250, 1)",
          shadowOpacity: 0.65,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

function SmallBear({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  const a = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    a.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    // After it appears, keep a subtle looping float so motion is always visible.
    float.value = withDelay(
      delay + 420,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [a, delay]);

  const style = useAnimatedStyle(() => {
    // Spawn at the origin (0,0) then fly to (x,y).
    const opacity = interpolate(a.value, [0, 0.12, 1], [0, 0.75, 1]);
    const s = interpolate(a.value, [0, 0.65, 1], [0.30, 1.08, 1]);
    const tx = interpolate(a.value, [0, 1], [0, x]);
    const ty = interpolate(a.value, [0, 1], [0, y]);
    // A tiny overshoot arc, makes it feel like it "pops out".
    const arc = interpolate(a.value, [0, 0.6, 1], [10, -8, 0]);
    const drift = interpolate(float.value, [0, 1], [-4, 4]);
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty + arc + drift }, { scale: s * scale }],
    };
  });

  return (
    <Animated.View style={[styles.smallBearWrap, style]}>
      <SmallShine />
      <Image source={BEAR} style={styles.smallBear} />
    </Animated.View>
  );
}

function SmallShine() {
  // A compact shine: cross rays + core glow (still not a bubble).
  return (
    <View pointerEvents="none" style={styles.smallShineWrap}>
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.00)", "rgba(196, 181, 253, 0.50)", "rgba(196, 181, 253, 0.00)"]}
        start={{ x: 0.0, y: 0.5 }}
        end={{ x: 1.0, y: 0.5 }}
        style={[styles.smallRay, { width: 120, height: 18 }]}
      />
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.00)", "rgba(167, 139, 250, 0.42)", "rgba(196, 181, 253, 0.00)"]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={[styles.smallRay, { width: 18, height: 120, transform: [{ rotate: "10deg" }] }]}
      />
      <View
        style={{
          position: "absolute",
          width: 86,
          height: 86,
          borderRadius: 999,
          backgroundColor: "rgba(196, 181, 253, 0.18)",
          shadowColor: PURPLE,
          shadowOpacity: 0.35,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  stage: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 999,
    // Keep only the circular "bubble" backdrop behind the bear.
    // No purple panel/box tint.
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  brandBig: {
    color: "rgba(88, 28, 135, 0.88)",
    fontWeight: "900",
    letterSpacing: 3,
    fontSize: 22,
  },
  brandEmph: {
    color: "rgba(88, 28, 135, 0.96)",
  },
  brandRest: {
    color: "rgba(88, 28, 135, 0.50)",
  },
  heroBearWrap: {
    position: "absolute",
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBear: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  glowWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ray: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9,
  },
  rayVertical: {
    transform: [{ rotate: "10deg" }],
  },
  bearsLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBearWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  smallShineWrap: {
    position: "absolute",
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  smallRay: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.85,
  },
  smallBear: {
    width: 92,
    height: 92,
    resizeMode: "contain",
    opacity: 0.95,
  },

  topBadge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  topBadgeCircle: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  topBadgeBear: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    opacity: 0.98,
  },
});

export default memo(WelcomeBearHeroBase);
