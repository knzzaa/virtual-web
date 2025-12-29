import React, { memo, useEffect } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  source: ImageSourcePropType;
  /** Choose a vibe; defaults to a clean purple glow that matches the app. */
  variant?: "purple" | "green";
  width?: number;
  height?: number;
  style?: any;
};

const ALinearGradient = Animated.createAnimatedComponent(LinearGradient);

function AnimatedHeroGlowBase({ source, variant = "purple", width = 240, height = 200, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);

  const floatStyle = useAnimatedStyle(() => {
    const translateY = interpolate(t.value, [0, 1], [0, -8]);
    const rotate = `${interpolate(t.value, [0, 1], [-1.2, 1.2])}deg`;
    return {
      transform: [{ translateY }, { rotate }],
    };
  });

  const glowAStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 1], [0.18, 0.42]);
    const scale = interpolate(t.value, [0, 1], [0.92, 1.04]);
    return { opacity, transform: [{ scale }] };
  });

  const glowBStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 1], [0.10, 0.28]);
    const scale = interpolate(t.value, [0, 1], [1.02, 0.96]);
    return { opacity, transform: [{ scale }] };
  });

  const colorsA =
    variant === "green"
      ? (["rgba(16,185,129,0.55)", "rgba(16,185,129,0.00)"] as const)
      : (["rgba(167,139,250,0.62)", "rgba(167,139,250,0.00)"] as const);

  const colorsB =
    variant === "green"
      ? (["rgba(34,197,94,0.35)", "rgba(34,197,94,0.00)"] as const)
      : (["rgba(236,72,153,0.28)", "rgba(236,72,153,0.00)"] as const);

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      {/* Back glow bloom */}
      <Animated.View style={[styles.glowWrap, glowBStyle]} pointerEvents="none">
        <ALinearGradient
          colors={colorsB}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={[styles.glow, { width: width * 1.25, height: height * 1.05 }]}
        />
      </Animated.View>

      {/* Primary glow */}
      <Animated.View style={[styles.glowWrap, glowAStyle]} pointerEvents="none">
        <ALinearGradient
          colors={colorsA}
          start={{ x: 0.15, y: 0.15 }}
          end={{ x: 0.9, y: 0.95 }}
          style={[styles.glow, { width: width * 1.15, height: height * 0.95 }]}
        />
      </Animated.View>

      {/* Floating hero image */}
      <Animated.View style={[styles.imageWrap, floatStyle]} pointerEvents="none">
        <Image source={source} style={{ width, height, resizeMode: "contain" }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    borderRadius: 999,
  },
});

export default memo(AnimatedHeroGlowBase);
