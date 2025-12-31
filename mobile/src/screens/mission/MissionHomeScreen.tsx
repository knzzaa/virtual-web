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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionHome">;

// match Material/Exam palette
const TITLE = "rgba(88, 28, 135, 0.94)";
const DESC = "rgba(88, 28, 135, 0.72)";
const EMPTY = "rgba(88, 28, 135, 0.82)";

const CARD_BG = "rgba(255,255,255,0.18)";
const CARD_BORDER = "rgba(255,255,255,0.45)";

const PILL_BG = "rgba(167, 139, 250, 0.10)";
const PILL_BORDER = "rgba(167, 139, 250, 0.22)";
const PILL_TEXT = "rgba(88, 28, 135, 0.80)";

export default function MissionHomeScreen({ navigation }: Props) {
  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // icon animation (tetep boleh, tapi warnanya disamain)
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
  const iconScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

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
    if (!data || mission === null) return "Mission";
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
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />

      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        {/* ✅ sama kayak Material/Exam: paddingTop insets.top + 54 */}
        <View style={{ paddingTop: insets.top + 54 }}>
          <View style={styles.card}>
            <View style={{ alignItems: "center" }}>
              <Animated.View
                style={[
                  styles.iconRing,
                  { transform: [{ translateY: iconTranslateY }, { scale: iconScale }] },
                ]}
              >
                <Image
                  source={require("../../../assets/img/mission.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </Animated.View>

              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.desc} numberOfLines={3}>
                {desc}
              </Text>
            </View>

            <View style={{ height: theme.spacing.lg }} />

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalQuestions || "-"}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>

              <View style={{ width: theme.spacing.md }} />

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{minutes || "-"}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>

            <View style={{ height: theme.spacing.lg }} />

            {/* ✅ Start Mission: dibikin pill (bukan gradient) supaya nyatu sama Exam/Material */}
            <Pressable
              disabled={!canStart || loading}
              onPress={() => navigation.navigate("MissionNext", { initialData: data ?? undefined })}
              style={({ pressed }) => [
                styles.primaryPill,
                (!canStart || loading) && { opacity: 0.55 },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.primaryPillText}>
                {loading ? "Loading…" : mission === null ? "All Completed" : "Start Mission"}
              </Text>
            </Pressable>

            <View style={{ height: theme.spacing.md }} />

            {/* ✅ View History + Refresh: persis gaya "View submissions" */}
            <View style={styles.ctaRow}>
              <Pressable
                style={({ pressed }) => [styles.submissionsPill, pressed && { opacity: 0.9 }]}
                onPress={() => navigation.navigate("MissionHistory")}
              >
                <Text style={styles.submissionsText}>View History</Text>
              </Pressable>

              <View style={{ width: theme.spacing.md }} />

              <Pressable
                style={({ pressed }) => [styles.submissionsPill, pressed && { opacity: 0.9 }]}
                onPress={load}
              >
                <Text style={styles.submissionsText}>{loading ? "Refreshing…" : "Refresh"}</Text>
              </Pressable>
            </View>

            {loading ? (
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : null}

            {!loading && mission === null ? (
              <Text style={styles.emptyNote}>You’ve completed all missions.</Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 26,
    marginBottom: theme.spacing.md,
    backgroundColor: CARD_BG,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },

  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  icon: { width: 56, height: 56 },

  title: { fontWeight: "800", fontSize: 18, marginTop: 12, marginBottom: 6, color: TITLE, lineHeight: 24, textAlign: "center" },
  desc: { opacity: 0.95, marginBottom: 8, color: DESC, lineHeight: 19, fontSize: 13, textAlign: "center", fontWeight: "700" },

  statsRow: { flexDirection: "row" },
  statCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderRadius: 22,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: TITLE },
  statLabel: { marginTop: 6, fontSize: 12, fontWeight: "800", color: DESC },

  primaryPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(167, 139, 250, 0.16)",
    borderColor: "rgba(167, 139, 250, 0.30)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryPillText: { fontSize: 13, fontWeight: "900", color: "rgba(88, 28, 135, 0.90)", letterSpacing: 0.3 },

  ctaRow: { flexDirection: "row", alignItems: "center" },

  submissionsPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: PILL_BG,
    borderColor: PILL_BORDER,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  submissionsText: { fontSize: 12, fontWeight: "800", color: PILL_TEXT },

  emptyNote: { color: EMPTY, textAlign: "center", marginTop: 12, fontWeight: "800" },
});