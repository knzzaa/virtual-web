import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../styles/theme";
import AnimatedAuthBackground from "../../components/AnimatedAuthBackground";
import SnowflakesBackground from "../../components/SnowflakesBackground";
import WelcomeShowcaseHero from "../../components/WelcomeShowcaseHero";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const INTRO_BEAR = require("../../../assets/img/bear.png");

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // Button press feedback (opening page only)
  const pressed = useSharedValue(0);
  const onPrimaryPressIn = () => {
    pressed.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
  };
  const onPrimaryPressOut = () => {
    pressed.value = withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) });
  };

  const primaryAnimStyle = useAnimatedStyle(() => {
    const s = interpolate(pressed.value, [0, 1], [1, 0.985]);
    return { transform: [{ scale: s }] };
  });

  // Intro overlay inspired by the reference: logo in center + expanding purple glow.
  const intro = useSharedValue(1);
  const flash = useSharedValue(0);
  React.useEffect(() => {
    // Cinematic but quick (~3s total): hold + smooth fade.
    intro.value = withDelay(1700, withTiming(0, { duration: 1300, easing: Easing.out(Easing.cubic) }));

    // Exposure flash right at the start (~120ms).
    flash.value = withSequence(
      withTiming(1, { duration: 50, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 110, easing: Easing.out(Easing.quad) })
    );
  }, [intro]);

  const flashStyle = useAnimatedStyle(() => {
    const opacity = interpolate(flash.value, [0, 1], [0, 1]);
    // Tiny scale so it feels like an exposure bloom.
    const scale = interpolate(flash.value, [0, 1], [1, 1.04]);
    return { opacity, transform: [{ scale }] };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(intro.value, [0, 0.2, 1], [0, 0.6, 1]);
    return {
      opacity,
    };
  });

  const burstStyle = useAnimatedStyle(() => {
    // A quick flash early, then calm.
    const opacity = interpolate(intro.value, [0, 0.75, 0.92, 1], [0, 0.0, 0.35, 0.0]);
    const scale = interpolate(intro.value, [0, 1], [1.4, 0.85]);
    return { opacity, transform: [{ scale }] };
  });

  const bearStyle = useAnimatedStyle(() => {
    // "Cinematic" entrance: bear starts slightly smaller and settles.
    const opacity = interpolate(intro.value, [0, 0.1, 1], [0, 1, 1]);
    const scale = interpolate(intro.value, [0, 0.72, 1], [1.1, 1.0, 0.94]);
    const y = interpolate(intro.value, [0, 1], [-10, 0]);
    return { opacity, transform: [{ translateY: y }, { scale }] };
  });

  const wordmarkStyle = useAnimatedStyle(() => {
    const opacity = interpolate(intro.value, [0, 0.25, 1], [0, 0.65, 1]);
    const y = interpolate(intro.value, [0, 1], [10, 0]);
    return { opacity, transform: [{ translateY: y }] };
  });

  return (
    <View style={styles.screen}>
      <AnimatedAuthBackground>
        <SnowflakesBackground count={128} speedMultiplier={2.6} sizeMultiplier={0.95} />
        <SnowflakesBackground count={36} speedMultiplier={2.2} sizeMultiplier={1.45} />
        <SnowflakesBackground count={18} speedMultiplier={1.9} sizeMultiplier={2.1} />
      </AnimatedAuthBackground>

      {/* soft header glow */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(167, 139, 250, 0.32)", "rgba(167, 139, 250, 0.00)"]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={styles.topGlow}
      />

      <View style={[styles.wrap, { paddingTop: insets.top + theme.spacing.xl }]}>
        <View style={styles.heroCard}>
          <WelcomeShowcaseHero />

          <Text style={styles.title}>Start your English journey</Text>
          <Text style={styles.subtitle}>
            Materials, exams, and missions — in one beautiful place.
          </Text>

          <View style={{ height: theme.spacing.lg }} />

          <Animated.View style={primaryAnimStyle}>
            <Pressable
              style={styles.primaryOutline}
              onPress={() => navigation.navigate("Register")}
              onPressIn={onPrimaryPressIn}
              onPressOut={onPrimaryPressOut}
            >
              <Text style={styles.primaryOutlineText}>Get Started</Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Pressable style={styles.secondary} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.secondaryText}>I already have an account</Text>
            <Text style={styles.secondaryLink}>Login</Text>
          </Pressable>
        </View>
      </View>

      {/* Intro overlay on top (auto fades out). */}
      <Animated.View pointerEvents="none" style={[styles.introOverlay, overlayStyle]}>
        <Animated.View pointerEvents="none" style={[styles.introFlash, flashStyle]} />
        <Animated.View style={[styles.introBurst, burstStyle]} />
        <Animated.View style={[styles.introBearWrap, bearStyle]}>
          <View style={styles.introBearGlow} />
          <Animated.Image source={INTRO_BEAR} style={styles.introBear} />
        </Animated.View>
        <Animated.View style={[styles.introWordmarkWrap, wordmarkStyle]}>
          <Text style={styles.introWordmark}>ENGLISHLAB</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4efff" },
  topGlow: { position: "absolute", left: 0, right: 0, top: 0, height: 220 },
  wrap: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 30,
    padding: theme.spacing.xl,
    backgroundColor: "rgba(255,255,255,0.00)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.14)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#2a0a57",
    maxWidth: 360,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(17, 24, 39, 0.62)",
    lineHeight: 20,
    maxWidth: 360,
    textAlign: "center",
  },
  // Opening page only: transparent/outline primary button.
  primaryOutline: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.30)",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryOutlineText: {
    color: "rgba(88, 28, 135, 0.95)",
    fontWeight: "900",
    letterSpacing: 1.2,
    fontSize: 14,
  },
  secondary: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  secondaryText: {
    color: "rgba(17, 24, 39, 0.65)",
    fontWeight: "700",
  },
  secondaryLink: {
    color: "rgba(124, 58, 237, 0.95)",
    fontWeight: "900",
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 239, 255, 0.92)",
  },
  introFlash: {
    ...StyleSheet.absoluteFillObject,
    // Slight lavender tint makes the flash visible over pale backgrounds.
    backgroundColor: "rgba(237, 233, 254, 1)",
  },
  introBurst: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: "rgba(167, 139, 250, 0.25)",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.75,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  introBearWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  introBearGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    shadowColor: "rgba(255,255,255,1)",
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  introBear: {
    width: 156,
    height: 156,
    resizeMode: "contain",
    opacity: 0.98,
  },
  introWordmarkWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  introWordmark: {
    color: "rgba(88, 28, 135, 0.92)",
    fontWeight: "900",
    letterSpacing: 4,
    fontSize: 18,
  },
});
