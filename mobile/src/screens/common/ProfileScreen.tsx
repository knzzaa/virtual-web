import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Button from "../../components/Button";
import { useAuth } from "../../context/auth.context";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import PurpleLights from "../../components/PurpleLights";

export default function ProfileScreen() {
  const { me, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const subtitle = useMemo(() => "Keep learning consistently — you'll get there.", []);

  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [t]);

  const avatarFloatStyle = useAnimatedStyle(() => {
    const dy = interpolate(t.value, [0, 1], [0, -10]);
    return { transform: [{ translateY: dy }] };
  });

  const chipPulseStyle = useAnimatedStyle(() => {
    const s = interpolate(t.value, [0, 1], [1, 1.03]);
    const o = interpolate(t.value, [0, 1], [0.92, 1]);
    return { transform: [{ scale: s }], opacity: o };
  });

  if (!me) {
    return (
      <View style={styles.screen}>
        <AnimatedAppBackground />
        <PurpleLights count={8} />
        <View style={[styles.wrap, { paddingTop: insets.top + 64 }]}>
          <Text style={{ color: theme.colors.text }}>Not logged in</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
  <PurpleLights count={10} speed={2.4} />
      <View style={[styles.wrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + theme.spacing.lg }]}>
        {/* hero */}
        <View style={styles.hero}>
          <Animated.View style={avatarFloatStyle}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Image source={require("../../../assets/img/about-us.png")} style={styles.avatar} />
              </View>
            </View>
          </Animated.View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={{ height: theme.spacing.md }} />
          <View style={styles.chipsRow}>
            <Animated.View style={chipPulseStyle}>
              <View style={styles.chip}>
              <Text style={styles.chipText}>Student</Text>
              </View>
            </Animated.View>
            <Animated.View style={chipPulseStyle}>
              <View style={styles.chip}>
              <Text style={styles.chipText}>EnglishLab</Text>
              </View>
            </Animated.View>
          </View>
        </View>

        <View style={{ height: theme.spacing.lg }} />

        {/* info */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{me.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{me.email}</Text>
          </View>
        </View>

        <View style={{ height: theme.spacing.lg }} />

        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, padding: theme.spacing.lg },
  hero: { alignItems: "center" },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 999,
    padding: 2,
    backgroundColor: "rgba(196, 181, 253, 0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  avatarInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 54, height: 54 },
  card: {
    ...theme.card,
    padding: theme.spacing.xl,
  },
  title: { fontSize: 28, fontWeight: "900", color: "rgba(17, 24, 39, 0.96)", textAlign: "center", marginTop: 12 },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "rgba(88, 28, 135, 0.65)",
    fontSize: 13,
    lineHeight: 18,
  },
  chipsRow: { flexDirection: "row", gap: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.60)",
  },
  chipText: { fontWeight: "900", color: "rgba(88, 28, 135, 0.78)", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { fontSize: 12, fontWeight: "900", color: "rgba(88, 28, 135, 0.70)" },
  value: { fontSize: 15, fontWeight: "900", color: "rgba(76, 29, 149, 0.95)", textAlign: "right", flex: 1 },
  divider: { height: 1, backgroundColor: "rgba(196, 181, 253, 0.35)", marginVertical: theme.spacing.lg },
});