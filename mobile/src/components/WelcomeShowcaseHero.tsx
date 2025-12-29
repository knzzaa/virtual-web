import React, { memo, useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Feature = {
  title: string;
  subtitle: string;
  icon: "book" | "quiz" | "flag";
  delay: number;
};

type Props = {
  autoplay?: boolean;
};

const BEAR = require("../../assets/img/bear.png");

function IconGlyph({ type }: { type: Feature["icon"] }) {
  const glyph = type === "book" ? "📚" : type === "quiz" ? "📝" : "🏁";
  return <Text style={styles.glyph}>{glyph}</Text>;
}

function FeatureCard({ f, t }: { f: Feature; t: SharedValue<number> }) {
  const a = useSharedValue(0);

  useEffect(() => {
    a.value = withDelay(f.delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [a, f.delay]);

  const style = useAnimatedStyle(() => {
    const opacity = interpolate(a.value, [0, 1], [0, 1]);
    const y = interpolate(a.value, [0, 1], [14, 0]);
    const s = interpolate(a.value, [0, 1], [0.98, 1]);

    // subtle idle drift in place (no overlap)
    const drift = interpolate(t.value, [0, 1], [-2, 2]);

    return {
      opacity,
      transform: [{ translateY: y + drift }, { scale: s }],
    };
  });

  return (
    <Animated.View style={[styles.featureCard, style]}>
      <LinearGradient
        colors={["rgba(196, 181, 253, 0.55)", "rgba(255,255,255,0.88)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.featureRow}>
        <View style={styles.iconChip}>
          <IconGlyph type={f.icon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>{f.title}</Text>
          <Text style={styles.featureSub}>{f.subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function WelcomeShowcaseHeroBase({ autoplay = true }: Props) {
  const t = useSharedValue(0);
  const bearIn = useSharedValue(0);

  const features = useMemo<Feature[]>(
    () => [
      { title: "Materials", subtitle: "Learn with bite-sized lessons", icon: "book", delay: 120 },
      { title: "Exams", subtitle: "Test yourself, see progress", icon: "quiz", delay: 260 },
      { title: "Missions", subtitle: "Daily goals that feel fun", icon: "flag", delay: 400 },
    ],
    []
  );

  useEffect(() => {
    if (!autoplay) return;

    // Looping idle timeline
    t.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }), -1, true);

    // Bear peeks in from the left, then tiny bounce.
    bearIn.value = withSequence(
      withTiming(0, { duration: 40 }),
      withDelay(60, withTiming(1, { duration: 680, easing: Easing.out(Easing.cubic) })),
      withTiming(1, { duration: 10 })
    );
  }, [autoplay, bearIn, t]);

  const bearStyle = useAnimatedStyle(() => {
    const opacity = interpolate(bearIn.value, [0, 1], [0, 1]);
    const x = interpolate(bearIn.value, [0, 1], [-16, 0]);
    const rot = `${interpolate(bearIn.value, [0, 1], [-10, 0])}deg`;
    const bob = interpolate(t.value, [0, 1], [-3, 3]);
    return {
      opacity,
      transform: [{ translateX: x }, { translateY: bob }, { rotate: rot }],
    };
  });

  const haloStyle = useAnimatedStyle(() => {
    const opacity = interpolate(bearIn.value, [0, 1], [0, 1]);
    const pulse = interpolate(t.value, [0, 1], [0.96, 1.04]);
    return { opacity, transform: [{ scale: pulse }] };
  });

  return (
    <View style={styles.root}>
      {/* Header chip */}
      <View style={styles.headerRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>ENGLISHLAB</Text>
        </View>
          <View style={styles.pillSpacer} />
      </View>

      {/* Mascot + glow */}
      <View style={styles.mascotRow}>
        <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none" />
        <Animated.View style={[styles.mascot, bearStyle]}>
          <Image source={BEAR} style={styles.bear} />
          <View style={styles.scarf} />
        </Animated.View>

        <View style={styles.mascotText}>
          <Text style={styles.heroTitle}>Cute learning.
            <Text style={styles.heroTitleEmph}> Serious progress.</Text>
          </Text>
          <Text style={styles.heroSub}>A clean, calm experience — with a little magic.</Text>
        </View>
      </View>

      {/* Feature stack (no overlap, strict spacing) */}
      <View style={styles.stack}>
        {features.map((f) => (
          <FeatureCard key={f.title} f={f} t={t} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    paddingTop: 4,
    paddingBottom: 6,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.14)",
  },
  pillText: {
    color: "rgba(88, 28, 135, 0.92)",
    fontWeight: "900",
    letterSpacing: 3,
    fontSize: 13,
  },
  pillGhost: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(167, 139, 250, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.12)",
  },
  pillGhostText: {
    color: "rgba(88, 28, 135, 0.55)",
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: 12,
  },
  pillSpacer: {
    width: 64,
    height: 1,
  },

  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  halo: {
    position: "absolute",
    left: 18,
    top: 4,
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: "rgba(196, 181, 253, 0.22)",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.65,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  mascot: {
    width: 106,
    height: 106,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.00)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  bear: {
    width: 78,
    height: 78,
    resizeMode: "contain",
  },
  scarf: {
    position: "absolute",
    width: 38,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(124, 58, 237, 0.72)",
    bottom: 26,
    left: 44,
    transform: [{ rotate: "-12deg" }],
  },

  mascotText: {
    flex: 1,
  },
  heroTitle: {
    color: "#2a0a57",
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 22,
  },
  heroTitleEmph: {
    color: "rgba(124, 58, 237, 0.95)",
  },
  heroSub: {
    marginTop: 6,
    color: "rgba(17, 24, 39, 0.62)",
    lineHeight: 18,
  },

  stack: {
    gap: 10,
  },
  featureCard: {
    borderRadius: 18,
    padding: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.12)",
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(167, 139, 250, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.12)",
  },
  glyph: {
    fontSize: 18,
  },
  featureTitle: {
    color: "rgba(88, 28, 135, 0.92)",
    fontWeight: "900",
  },
  featureSub: {
    marginTop: 2,
    color: "rgba(17, 24, 39, 0.60)",
    fontWeight: "700",
    fontSize: 12,
  },
});

export default memo(WelcomeShowcaseHeroBase);
