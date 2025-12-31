import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import Button from "../../components/Button";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionHome">;

// Palette ungu yang sama dengan Button.tsx & background kamu
const PURPLE_BASE = "rgba(124, 58, 237, 1)";
const PURPLE_MID = "rgba(167, 139, 250, 1)";
const PURPLE_LIGHT = "rgba(196, 181, 253, 1)";
const PURPLE_TEXT = "rgba(76, 29, 149, 0.95)";

const CARD_BG = "rgba(255,255,255,0.70)";
const CARD_BG_SOFT = "rgba(255,255,255,0.58)";
const PURPLE_SOFT = "rgba(124,58,237,0.10)";
const PURPLE_BORDER = "rgba(124,58,237,0.18)";

export default function MissionHomeScreen({ navigation }: Props) {
  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // icon animation: float + rotate + glow
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const iconTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const iconScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const iconRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] });

  const haloScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const haloOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.10] });

  async function load() {
    setLoading(true);
    try {
      const res = await missionService.next();
      setData(res);
    } catch (e: any) {
      Alert.alert("Failed to load mission", e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const mission = (data as any)?.mission ?? null;

  const title = useMemo(() => {
    if (!data) return "Mission";
    if (mission === null) return "Mission";
    return mission?.title ?? "Mission";
  }, [data, mission]);

  const desc = useMemo(() => {
    if (!data) return "Loading mission…";
    if (mission === null) return (data as any)?.message ?? "All missions completed!";
    return mission?.description ?? "Test your knowledge and level up!";
  }, [data, mission]);

  const totalQuestions = useMemo(() => {
    if (!mission || mission === null) return 0;
    return Number(mission.totalQuestions ?? 0);
  }, [mission]);

  const minutes = useMemo(() => {
    if (!mission || mission === null) return 0;
    const raw = Number((mission as any)?.minutes ?? (mission as any)?.estimatedMinutes ?? 0);
    if (raw > 0) return raw;
    if (totalQuestions > 0) return Math.max(5, Math.round(totalQuestions * 1.5));
    return 0;
  }, [mission, totalQuestions]);

  const canStart = !loading && !!data && mission !== null;

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <View style={styles.wrap}>
        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: PURPLE_BORDER }]}>
          <View style={{ alignItems: "center" }}>
            <View style={styles.iconWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.iconHalo,
                  {
                    backgroundColor: PURPLE_BASE,
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.iconRing,
                  {
                    borderColor: "rgba(124,58,237,0.25)",
                    transform: [{ translateY: iconTranslateY }, { scale: iconScale }, { rotate: iconRotate }],
                  },
                ]}
              >
                <Image
                  source={require("../../../assets/img/mission.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            <Text style={[styles.title, { color: PURPLE_TEXT }]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.desc, { color: theme.colors.muted }]} numberOfLines={3}>
              {desc}
            </Text>
          </View>

          <View style={{ height: theme.spacing.lg }} />

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: CARD_BG_SOFT, borderColor: "rgba(124,58,237,0.14)" }]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalQuestions || "-"}</Text>
              <Text style={[styles.statLabel, { color: PURPLE_BASE }]}>Questions</Text>
            </View>

            <View style={{ width: theme.spacing.md }} />

            <View style={[styles.statCard, { backgroundColor: CARD_BG_SOFT, borderColor: "rgba(124,58,237,0.14)" }]}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{minutes || "-"}</Text>
              <Text style={[styles.statLabel, { color: PURPLE_BASE }]}>Minutes</Text>
            </View>
          </View>

          <View style={{ height: theme.spacing.lg }} />

          {/* Primary CTA (pakai Button.tsx kamu biar sama persis fitur lain) */}
          <Button
            title={loading ? "Loading…" : mission === null ? "All Completed" : "Start Mission"}
            disabled={!canStart || loading}
            onPress={() => navigation.navigate("MissionNext", { initialData: data ?? undefined })}
          />

          <View style={{ height: theme.spacing.md }} />

          <View style={styles.ctaRow}>
            <Pressable
              style={[
                styles.secondaryBtn,
                { borderColor: "rgba(124,58,237,0.28)", backgroundColor: PURPLE_SOFT },
              ]}
              onPress={() => navigation.navigate("MissionHistory")}
            >
              <Text style={[styles.secondaryText, { color: PURPLE_TEXT }]}>View History</Text>
            </Pressable>

            <View style={{ width: theme.spacing.md }} />

            <Pressable
              style={[
                styles.secondaryBtn,
                { borderColor: "rgba(124,58,237,0.28)", backgroundColor: "rgba(255,255,255,0.45)" },
              ]}
              onPress={load}
            >
              <Text style={[styles.secondaryText, { color: PURPLE_TEXT }]}>
                {loading ? "Refreshing…" : "Refresh"}
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : null}

          {/* subtle accent line biar nyambung sama gradient vibe */}
          <View style={[styles.softLine, { backgroundColor: PURPLE_LIGHT }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  wrap: { flex: 1, padding: theme.spacing.lg },

  card: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
  },

  iconWrap: { position: "relative", width: 118, height: 118, alignItems: "center", justifyContent: "center" },
  iconHalo: { position: "absolute", width: 110, height: 110, borderRadius: 999 },
  iconRing: {
    width: 102,
    height: 102,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: { width: 58, height: 58 },

  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  desc: { marginTop: 6, opacity: 0.9, fontWeight: "700", textAlign: "center" },

  statsRow: { flexDirection: "row" },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { marginTop: 6, fontSize: 12, fontWeight: "900", opacity: 0.95 },

  ctaRow: { flexDirection: "row", alignItems: "center" },

  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18, // match Button radius vibe
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontWeight: "900", letterSpacing: 0.3 },

  softLine: {
    marginTop: 14,
    height: 3,
    borderRadius: 999,
    opacity: 0.35,
  },
});