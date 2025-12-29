import React, { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ALinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  children?: React.ReactNode;
};

/**
 * Animated purple gradient background + optional overlay (children).
 * Safe for Expo dev client / reanimated.
 */
function AnimatedAuthBackgroundBase({ children }: Props) {
  const t = useSharedValue(0);

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(t.value, [0, 1], [-6, 6])}deg`;
    const scale = interpolate(t.value, [0, 1], [1.05, 1.12]);
    const tx = interpolate(t.value, [0, 1], [-30, 30]);
    const ty = interpolate(t.value, [0, 1], [20, -20]);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate }, { scale }],
    };
  });

  // Keep colors stable; only the layer moves.
  const colors = useMemo(
    // Pastel lilac / light purple vibe
    () => ["#fbf9ff", "#f3ecff", "#efe4ff", "#e6d8ff", "#f8ecff"] as const,
    []
  );

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedGradientStyle]} pointerEvents="none">
        <ALinearGradient
          colors={colors}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.95 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Soft vignette for depth */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.0)", "rgba(17, 24, 39, 0.06)"]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default memo(AnimatedAuthBackgroundBase);
