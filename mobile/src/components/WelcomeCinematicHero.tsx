import React, { memo, useEffect } from "react";
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
  autoplay?: boolean;
};

const BEAR = require("../../assets/img/bear.png");

// Clean, cinematic hero:
// - Perfectly centered main circle
// - Bear pops from small to big
// - Bear flies into top badge circle
// - Brand text reveals with masked sweep
function WelcomeCinematicHeroBase({ autoplay = true }: Props) {
  const t = useSharedValue(0); // 0..1 master
  const idle = useSharedValue(0);

  useEffect(() => {
    if (!autoplay) return;

    t.value = withSequence(
      withTiming(0, { duration: 60 }),
      withDelay(120, withTiming(1, { duration: 1650, easing: Easing.inOut(Easing.cubic) }))
    );

    // Idle breathing starts after intro.
    idle.value = withDelay(
      1700,
      withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [autoplay, idle, t]);

  const circleStyle = useAnimatedStyle(() => {
    const s = interpolate(t.value, [0, 0.35, 1], [0.92, 1.0, 1.0]);
    const y = interpolate(t.value, [0, 1], [8, 0]);
    return { transform: [{ translateY: y }, { scale: s }] };
  });

  const portalGlowStyle = useAnimatedStyle(() => {
    const pulse = interpolate(idle.value, [0, 1], [0.65, 1]);
    const opacity = interpolate(t.value, [0, 0.15, 1], [0, 0.8, 1]);
    return { opacity, transform: [{ scale: pulse }] };
  });

  // Bear: small -> big (with overshoot) -> lift up
  const bearStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 0.08, 1], [0, 1, 1]);
    const scale = interpolate(t.value, [0, 0.45, 0.62, 1], [0.32, 1.08, 1.0, 0.86]);
    const y = interpolate(t.value, [0, 0.62, 1], [18, 0, -104]);

    // tiny idle float
    const float = interpolate(idle.value, [0, 1], [-2.5, 2.5]);

    return {
      opacity,
      transform: [{ translateY: y + float }, { scale }],
    };
  });

  // Burst light at the "pop" moment.
  const burstStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 0.42, 0.54, 0.72, 1], [0, 0, 0.85, 0.25, 0]);
    const scale = interpolate(t.value, [0, 0.54, 1], [0.6, 1.15, 1.35]);
    return { opacity, transform: [{ scale }] };
  });

  // Top badge circle appears slightly later.
  const badgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 0.72, 1], [0, 0.0, 1]);
    const scale = interpolate(t.value, [0, 1], [0.9, 1]);
    return { opacity, transform: [{ scale }] };
  });

  // Brand reveal: fade + subtle tracking.
  const brandStyle = useAnimatedStyle(() => {
    const opacity = interpolate(t.value, [0, 0.58, 1], [0, 0.4, 1]);
    const y = interpolate(t.value, [0, 1], [10, 0]);
    return { opacity, transform: [{ translateY: y }] };
  });

  // Mask sweep (fake mask using a moving gradient overlay).
  const sweepStyle = useAnimatedStyle(() => {
    const x = interpolate(t.value, [0.55, 1], [-120, 140]);
    const opacity = interpolate(t.value, [0, 0.62, 0.92, 1], [0, 0.85, 0.25, 0]);
    return { opacity, transform: [{ translateX: x }] };
  });

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        {/* Main circle */}
        <Animated.View style={[styles.circle, circleStyle]}>
          {/* Inner portal glow */}
          <Animated.View style={[styles.portalGlowWrap, portalGlowStyle]} pointerEvents="none">
            <LinearGradient
              colors={["rgba(196, 181, 253, 0.00)", "rgba(167, 139, 250, 0.55)", "rgba(196, 181, 253, 0.00)"]}
              start={{ x: 0.0, y: 0.5 }}
              end={{ x: 1.0, y: 0.5 }}
              style={[styles.portalRay, { transform: [{ rotate: "-18deg" }] }]}
            />
            <LinearGradient
              colors={["rgba(196, 181, 253, 0.00)", "rgba(124, 58, 237, 0.40)", "rgba(196, 181, 253, 0.00)"]}
              start={{ x: 0.5, y: 0.0 }}
              end={{ x: 0.5, y: 1.0 }}
              style={[styles.portalRay, styles.portalRayV]}
            />
            <View style={styles.portalCore} />
          </Animated.View>

          {/* Burst light */}
          <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]}>
            <LinearGradient
              colors={["rgba(255,255,255,0.00)", "rgba(255,255,255,0.85)", "rgba(255,255,255,0.00)"]}
              start={{ x: 0.0, y: 0.5 }}
              end={{ x: 1.0, y: 0.5 }}
              style={[styles.burstRay, { transform: [{ rotate: "-22deg" }] }]}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0.00)", "rgba(196, 181, 253, 0.70)", "rgba(255,255,255,0.00)"]}
              start={{ x: 0.5, y: 0.0 }}
              end={{ x: 0.5, y: 1.0 }}
              style={[styles.burstRay, styles.burstRayV]}
            />
            <View style={styles.burstCore} />
          </Animated.View>

          {/* Brand */}
          <Animated.View style={brandStyle}>
            <View style={styles.brandWrap}>
              <Text style={styles.brandText}>ENGLISHLAB</Text>
              <Animated.View style={[styles.brandSweep, sweepStyle]} pointerEvents="none">
                <LinearGradient
                  colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.65)", "rgba(255,255,255,0.0)"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Main bear */}
          <Animated.View style={[styles.bearWrap, bearStyle]} pointerEvents="none">
            <View style={styles.bearGlow} />
            <Image source={BEAR} style={styles.bear} />
            {/* Cute accessory: tiny scarf */}
            <View style={styles.scarf} />
          </Animated.View>
        </Animated.View>

        {/* Top badge */}
        <Animated.View style={[styles.badge, badgeStyle]} pointerEvents="none">
          <View style={styles.badgeCircle}>
            <View style={styles.badgeGlow} />
            <Image source={BEAR} style={styles.badgeBear} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    height: 260,
  },
  stage: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  circle: {
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(167, 139, 250, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },

  portalGlowWrap: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  portalRay: {
    position: "absolute",
    width: 260,
    height: 44,
    borderRadius: 999,
  },
  portalRayV: {
    width: 44,
    height: 260,
  },
  portalCore: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(196, 181, 253, 0.18)",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.55,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
  },

  burst: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  burstRay: {
    position: "absolute",
    width: 270,
    height: 56,
    borderRadius: 999,
  },
  burstRayV: {
    width: 56,
    height: 270,
  },
  burstCore: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    shadowColor: "rgba(255,255,255,1)",
    shadowOpacity: 0.65,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 0 },
  },

  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.60)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.12)",
  },
  brandText: {
    color: "rgba(88, 28, 135, 0.92)",
    fontWeight: "900",
    letterSpacing: 3,
    fontSize: 18,
  },
  brandSweep: {
    position: "absolute",
    left: -80,
    top: -10,
    width: 120,
    height: 80,
    transform: [{ rotate: "15deg" }],
  },

  bearWrap: {
    position: "absolute",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  bearGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(167, 139, 250, 0.26)",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.70,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
  },
  bear: {
    width: 128,
    height: 128,
    resizeMode: "contain",
  },
  scarf: {
    position: "absolute",
    width: 54,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(124, 58, 237, 0.72)",
    bottom: 56,
    left: 66,
    transform: [{ rotate: "-12deg" }],
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  badge: {
    position: "absolute",
    top: -18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCircle: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.90)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  badgeGlow: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 999,
    backgroundColor: "rgba(196, 181, 253, 0.22)",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeBear: {
    width: 62,
    height: 62,
    resizeMode: "contain",
  },
});

export default memo(WelcomeCinematicHeroBase);
