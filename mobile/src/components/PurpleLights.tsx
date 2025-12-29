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

type Light = {
  xPct: number;
  yPct: number;
  size: number;
  delay: number;
  drift: number;
  alpha: number;
  blur: number;
  tint: "purple" | "pink";
};

type Props = {
  count?: number;
  /** Motion speed multiplier. 1 = default. Higher = faster. */
  speed?: number;
};

/**
 * Soft moving purple/pink bokeh lights for background decoration.
 * Layer this on top of a gradient background.
 */
function PurpleLightsBase({ count = 10, speed = 1 }: Props) {
  const lights = useMemo<Light[]>(() => {
    const arr: Light[] = [];
    for (let i = 0; i < count; i++) {
      const seed = (i * 91) % 97;
      arr.push({
        xPct: ((seed * 37) % 100) / 100,
        yPct: ((seed * 61) % 100) / 100,
        size: 90 + ((seed * 17) % 120),
        delay: (seed % 10) * 220,
        drift: 14 + ((seed * 9) % 22),
        alpha: 0.05 + ((seed % 6) * 0.008),
        blur: 28 + ((seed * 5) % 30),
        tint: seed % 2 === 0 ? "purple" : "pink",
      });
    }
    return arr;
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {lights.map((l, idx) => (
        <LightBlob key={idx} l={l} speed={speed} />
      ))}
    </View>
  );
}

function LightBlob({ l, speed }: { l: Light; speed: number }) {
  const p = useSharedValue(0);
  const tw = useSharedValue(0);

  React.useEffect(() => {
    p.value = withRepeat(
      withDelay(
        l.delay,
        withTiming(1, { duration: Math.max(2400, 12000 / Math.max(0.25, speed)), easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    tw.value = withRepeat(
      withDelay(
        l.delay / 2,
        withTiming(1, { duration: Math.max(1800, 4200 / Math.max(0.25, speed)), easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [p, tw, l.delay, speed]);

  const style = useAnimatedStyle(() => {
    const dx = interpolate(p.value, [0, 1], [-l.drift, l.drift]);
    const dy = interpolate(p.value, [0, 1], [l.drift, -l.drift]);
    const scale = interpolate(tw.value, [0, 1], [0.92, 1.06]);
    const opacity = interpolate(tw.value, [0, 1], [l.alpha * 0.65, l.alpha]);

    return {
      opacity,
      transform: [{ translateX: dx }, { translateY: dy }, { scale }],
    };
  });

  const backgroundColor = l.tint === "purple" ? "rgba(124, 58, 237, 1)" : "rgba(236, 72, 153, 1)";

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: l.size,
          height: l.size,
          borderRadius: l.size / 2,
          left: `${l.xPct * 100}%`,
          top: `${l.yPct * 100}%`,
          shadowRadius: l.blur,
          backgroundColor,
          shadowColor: backgroundColor,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
  },
});

export default memo(PurpleLightsBase);
