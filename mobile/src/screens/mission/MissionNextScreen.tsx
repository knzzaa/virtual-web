// src/screens/mission/MissionNextScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import Button from "../../components/Button";
import { missionService } from "../../services/mission.service";
import type { MissionAnswerResponse, MissionNextResponse } from "../../types/dtos";
import type { MissionStackParamList } from "../../navigation/MissionStack";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionNext">;

/**
 * Map filename/relative path -> local assets (RN butuh require statik).
 * Path relatif dari: mobile/src/screens/mission/MissionNextScreen.tsx
 * ke: mobile/assets/img/*
 */
const LOCAL_IMG: Record<string, any> = {
  "about-us.png": require("../../../assets/img/about-us.png"),
  "bear.png": require("../../../assets/img/bear.png"),
  "books.png": require("../../../assets/img/books.png"),
  "clock.png": require("../../../assets/img/clock.png"),
  "exam.png": require("../../../assets/img/exam.png"),
  "login.png": require("../../../assets/img/login.png"),
  "material.png": require("../../../assets/img/material.png"),
  "mission-completed.png": require("../../../assets/img/mission-completed.png"),
  "mission.png": require("../../../assets/img/mission.png"),
  "profile.png": require("../../../assets/img/profile.png"),
  "register.png": require("../../../assets/img/register.png"),
  "Snowflake.png": require("../../../assets/img/Snowflake.png"),
};

function extractFileName(x: string) {
  const cleaned = x.split("?")[0].split("#")[0];
  const parts = cleaned.split("/");
  return parts[parts.length - 1];
}

function looksLikeImagePath(s: string) {
  const file = extractFileName(s).toLowerCase();
  return (
    file.endsWith(".png") ||
    file.endsWith(".jpg") ||
    file.endsWith(".jpeg") ||
    file.endsWith(".webp")
  );
}

function toImageSourceFromOption(opt: string) {
  const s = (opt ?? "").trim();
  if (!s) return undefined;

  // remote url
  if (s.startsWith("http://") || s.startsWith("https://")) return { uri: s };

  // filename / relative path -> map ke local assets kalau ada
  const file = extractFileName(s);
  if (LOCAL_IMG[file]) return LOCAL_IMG[file];

  // kalau bentuknya kayak image tapi ga ada di local mapping,
  // coba treat as uri (kadang backend ngasih path absolut tanpa host)
  if (looksLikeImagePath(s)) return { uri: s };

  return undefined;
}

export default function MissionNextScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // ✅ footer height dinamis biar padding scroll pas (nggak ketutup & tetep bisa scroll)
  const [footerH, setFooterH] = useState(0);

  const footerBottom = tabBarHeight + insets.bottom + theme.spacing.sm;
  const scrollBottomPadding = footerBottom + footerH + theme.spacing.md;

  const loadNext = useCallback(
    async (preferInitial?: boolean) => {
      setLoading(true);
      try {
        if (preferInitial && route.params?.initialData) {
          setData(route.params.initialData);
          return;
        }
        const res = await missionService.next();
        setData(res);
      } catch (e: any) {
        Alert.alert("Failed to load mission", e?.message ?? "Error");
      } finally {
        setLoading(false);
      }
    },
    [route.params]
  );

  useEffect(() => {
    // pakai initialData dari MissionHome biar lebih snappy
    loadNext(true);
  }, [loadNext]);

  const mission = (data as any)?.mission ?? null;

  // Kalau mission null artinya "All missions completed!"
  useEffect(() => {
    if (!loading && data && mission === null) {
      // Di desain kamu, lebih masuk akal balik ke Home
      // (karena MissionResult butuh percentage/finalScore)
      // tapi kalau mau, bisa bikin "All Completed Screen" sendiri.
      // Untuk sekarang: tampilkan alert sekali lalu balik.
      Alert.alert("Mission", (data as any)?.message ?? "All missions completed!");
      navigation.navigate("MissionHome");
    }
  }, [loading, data, mission, navigation]);

  const title = useMemo(() => {
    if (!mission || mission === null) return "Mission";
    return mission.title ?? "Mission";
  }, [mission]);

  const desc = useMemo(() => {
    if (!mission || mission === null) return "";
    return mission.description ?? "";
  }, [mission]);

  const totalQuestions = useMemo(() => {
    if (!mission || mission === null) return 0;
    return Number(mission.totalQuestions ?? 0);
  }, [mission]);

  const currentQuestion = useMemo(() => {
    if (!data || (data as any)?.mission === null) return null;
    return (data as any)?.currentQuestion ?? null;
  }, [data]);

  const progress = useMemo(() => {
    if (!data || (data as any)?.mission === null) return null;
    return (data as any)?.progress ?? null;
  }, [data]);

  const qNumber = Number(currentQuestion?.questionNumber ?? 0); // 1-based
  const qIndex0 = Math.max(0, qNumber - 1);
  const score = Number(progress?.currentScore ?? 0);
  const prompt = String(currentQuestion?.questionText ?? "Which one is correct?");
  const options: string[] = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];

  const progressPct = useMemo(() => {
    if (!totalQuestions) return 0;
    const cur = Math.min(qIndex0 + 1, totalQuestions);
    return Math.round((cur / totalQuestions) * 100);
  }, [qIndex0, totalQuestions]);

  // ====== sizing opsi 3 sebaris kayak web ======
  const { width } = Dimensions.get("window");
  const GAP = theme.spacing.sm;
  const H_PADDING = theme.spacing.lg;
  const OPTION_W = (width - H_PADDING * 2 - GAP * 2) / 3;

  const canNext = selectedIndex !== null && !submitting;

  const submitAnswer = async (idx: number) => {
    if (!mission || mission === null) return;
    if (!currentQuestion) return;
    if (submitting) return;

    setSelectedIndex(idx);
    setSubmitting(true);

    try {
      const slug = String(mission.slug);

      const res: MissionAnswerResponse = await missionService.answer(slug, {
        questionNumber: Number(currentQuestion.questionNumber),
        selectedOptionIndex: idx,
      });

      // kalau completed -> ke Result (sesuai MissionStackParamList)
      if (res.completed) {
        navigation.navigate("MissionResult", {
          percentage: Number(res.percentage ?? (res.totalQuestions ? Math.round(((res.finalScore ?? 0) / res.totalQuestions) * 100) : 0)),
          finalScore: Number(res.finalScore ?? res.currentScore ?? 0),
          totalQuestions: Number(res.totalQuestions ?? totalQuestions ?? 0),
        });
        return;
      }

      // lanjut next question
      await loadNext(false);
      setSelectedIndex(null);
    } catch (e: any) {
      Alert.alert("Failed to submit answer", e?.message ?? "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    // Submit dilakukan saat tap opsi (kayak web kamu: klik gambar langsung jawab).
    // Next cuma UX.
    if (!canNext) return;
  };

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <ScrollView
        style={styles.wrap}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.headerTop}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>✨</Text>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!desc && <Text style={styles.subtitle}>{desc}</Text>}

          <View style={styles.progressRow}>
            <Text style={styles.metaText}>
              Q{Math.min(qIndex0 + 1, totalQuestions || qIndex0 + 1)}/{totalQuestions || "?"} • Score {score}
            </Text>
            <Text style={styles.metaText}>{progressPct}%</Text>
          </View>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Question */}
        <View style={[styles.card, { marginTop: theme.spacing.sm }]}>
          <Text style={styles.qTitle}>{prompt}</Text>
          <Text style={styles.qHint}>Tap one option to answer.</Text>
        </View>

        {/* Options */}
        <View style={[styles.optionsRow, { marginTop: theme.spacing.sm, gap: GAP }]}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading question...</Text>
            </View>
          ) : (
            options.slice(0, 3).map((opt, idx) => {
              const img = toImageSourceFromOption(opt);
              const selected = selectedIndex === idx;

              // ✅ key unik (fix duplicate key warning)
              const key = `q${qNumber}-idx${idx}-${opt}`;

              return (
                <Pressable
                  key={key}
                  onPress={() => submitAnswer(idx)}
                  disabled={submitting}
                  style={({ pressed }) => [
                    {
                      width: OPTION_W,
                      borderRadius: theme.radius.lg,
                      overflow: "hidden",
                      borderWidth: theme.card.borderWidth,
                      borderColor: theme.card.borderColor,
                      backgroundColor: theme.colors.card,
                    },
                    selected ? styles.optionSelected : null,
                    pressed && !submitting ? { transform: [{ scale: 0.99 }] } : null,
                    submitting ? { opacity: 0.82 } : null,
                  ]}
                >
                  {img ? (
                    <Image
                      source={img}
                      style={{
                        width: "100%",
                        height: OPTION_W,
                        resizeMode: "cover",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: OPTION_W,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 8,
                      }}
                    >
                      {/* kalau option bukan image, tampilkan text */}
                      <Text
                        style={{ color: theme.colors.text, fontWeight: "900", textAlign: "center" }}
                        numberOfLines={3}
                      >
                        {String(opt)}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating footer */}
      <View
        pointerEvents="box-none"
        style={[
          styles.footerWrap,
          {
            left: theme.spacing.lg,
            right: theme.spacing.lg,
            bottom: footerBottom,
          },
        ]}
        onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
      >
        <View style={styles.footerCard}>
          <Button title={submitting ? "Submitting..." : "Next"} onPress={onNext} disabled={!canNext} />

          <Text style={styles.footerHint}>
            {submitting
              ? "Checking your answer..."
              : selectedIndex !== null
              ? "Answer submitted — loading next…"
              : "Select an answer to continue"}
          </Text>

          <View style={styles.footerRow}>
            <Pressable
              onPress={() => navigation.navigate("MissionHistory")}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.chipText}>History</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("MissionHome")}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.chipText}>Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  wrap: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  content: { paddingBottom: 24 },

  card: {
    padding: theme.card.padding,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.card.borderRadius,
    backgroundColor: theme.colors.card,
  },

  headerTop: { alignItems: "center", marginBottom: theme.spacing.sm },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167,139,250,0.18)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.28)",
  },
  iconEmoji: { fontSize: 22 },

  title: { fontWeight: "900", color: theme.colors.text, textAlign: "center", fontSize: 18 },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
  },

  progressRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: { color: theme.colors.muted, fontSize: 12, opacity: 0.8, fontWeight: "700" },
  progressBg: {
    marginTop: theme.spacing.sm,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(124, 58, 237, 0.9)",
  },

  qTitle: { fontWeight: "900", color: theme.colors.text, fontSize: 14 },
  qHint: { marginTop: 4, color: theme.colors.muted, fontSize: 12, opacity: 0.8 },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: "rgba(124, 58, 237, 0.55)",
  },

  loadingBox: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 8, color: theme.colors.muted, fontWeight: "700" },

  footerWrap: { position: "absolute" },
  footerCard: {
    padding: theme.card.padding,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.card.borderRadius,
    backgroundColor: theme.colors.card,
  },
  footerHint: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.muted,
    opacity: 0.8,
    fontWeight: "700",
  },
  footerRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(167,139,250,0.16)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.28)",
  },
  chipText: { fontWeight: "900", color: theme.colors.text },
});