import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionHome">;

export default function MissionHomeScreen({ navigation }: Props) {
  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!data) return "Missions";
    if (mission === null) return "Missions";
    return mission?.title ?? "Missions";
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

  // Kalau backend kamu punya durasi, taro di sini.
  // Kalau nggak ada, fallback ke estimasi sederhana.
  const minutes = useMemo(() => {
    if (!mission || mission === null) return 0;
    const raw = Number((mission as any)?.minutes ?? (mission as any)?.estimatedMinutes ?? 0);
    if (raw > 0) return raw;
    if (totalQuestions > 0) return Math.max(5, Math.round(totalQuestions * 1.5)); // fallback
    return 0;
  }, [mission, totalQuestions]);

  const canStart = !loading && !!data && mission !== null;

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <View style={styles.wrap}>
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Image
              source={require("../../../assets/img/mission.png")}
              style={styles.heroIcon}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroDesc}>{desc}</Text>
            </View>
          </View>

          <View style={{ height: theme.spacing.lg }} />

          {/* Stats */}
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

          {/* CTA */}
          <View style={styles.ctaRow}>
            <Pressable
              style={[styles.primaryBtn, !canStart && { opacity: 0.6 }]}
              disabled={!canStart}
              onPress={() => navigation.navigate("MissionNext", { initialData: data ?? undefined })}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator />
                  <Text style={styles.primaryText}>Loading…</Text>
                </View>
              ) : (
                <Text style={styles.primaryText}>
                  {mission === null ? "All Completed" : "Start Mission"}
                </Text>
              )}
            </Pressable>

            <View style={{ width: theme.spacing.md }} />

            <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("MissionHistory")}>
              <Text style={styles.secondaryText}>View History</Text>
            </Pressable>
          </View>

          {/* Refresh */}
          <Pressable style={styles.refreshLink} onPress={load}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, padding: theme.spacing.lg },

  heroCard: {
    padding: theme.spacing.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroIcon: { width: 52, height: 52, marginRight: theme.spacing.md },

  heroTitle: { fontSize: 22, fontWeight: "900", color: theme.colors.text },
  heroDesc: { marginTop: 6, color: theme.colors.muted, opacity: 0.85, fontWeight: "700" },

  statsRow: { flexDirection: "row" },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 20, fontWeight: "900", color: theme.colors.text },
  statLabel: { marginTop: 6, fontSize: 12, color: theme.colors.muted, fontWeight: "800" },

  ctaRow: { flexDirection: "row", alignItems: "center" },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "white", fontWeight: "900" },

  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: theme.colors.accent, fontWeight: "900" },

  refreshLink: { marginTop: theme.spacing.md, paddingVertical: 8, alignSelf: "flex-start" },
  refreshText: { color: theme.colors.accent, fontWeight: "900" },
});