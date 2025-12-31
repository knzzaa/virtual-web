// mobile/src/screens/mission/MissionNextScreen.tsx
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import Button from "../../components/Button";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse, MissionAnswerResponse } from "../../types/dtos";

function isImageLike(s: string) {
  const v = s.trim().toLowerCase();
  if (v.startsWith("http://") || v.startsWith("https://")) {
    return (
      v.includes(".png") ||
      v.includes(".jpg") ||
      v.includes(".jpeg") ||
      v.includes(".webp") ||
      v.includes("cloudinary") ||
      v.includes("img") ||
      v.includes("image")
    );
  }
  return v.startsWith("data:image/");
}

export default function MissionNextScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // data from API
  const [mission, setMission] = useState<{ slug: string; title: string; description?: string | null; totalQuestions: number } | null>(null);
  const [question, setQuestion] = useState<{ questionNumber: number; questionText: string; options: string[] } | null>(null);
  const [progress, setProgress] = useState<{ currentQuestionNumber: number; questionsAnswered: number; currentScore: number } | null>(null);

  // UI state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // feedback state
  const [checked, setChecked] = useState<{
    isCorrect: boolean;
    correctOptionIndex: number;
    show: boolean;
  } | null>(null);

  const footerBottom = tabBarHeight + insets.bottom + theme.spacing.sm;
  const FOOTER_HEIGHT = 140;
  const scrollBottomPadding = footerBottom + FOOTER_HEIGHT + theme.spacing.md;

  const canNext = selectedIndex !== null && !!checked?.show && !submitting;

  const normalizeAndSet = (res: MissionNextResponse) => {
    if ((res as any)?.mission === null) {
      // all completed
      setMission(null);
      setQuestion(null);
      setProgress(null);
      return;
    }

    const m = (res as any).mission;
    const q = (res as any).currentQuestion;
    const p = (res as any).progress;

    setMission({
      slug: String(m.slug),
      title: String(m.title ?? "Mission"),
      description: m.description ?? null,
      totalQuestions: Number(m.totalQuestions ?? 0),
    });

    setQuestion({
      questionNumber: Number(q.questionNumber ?? 1),
      questionText: String(q.questionText ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
    });

    setProgress({
      currentQuestionNumber: Number(p.currentQuestionNumber ?? q.questionNumber ?? 1),
      questionsAnswered: Number(p.questionsAnswered ?? 0),
      currentScore: Number(p.currentScore ?? 0),
    });

    setSelectedIndex(null);
    setChecked(null);
  };

  const loadNext = useCallback(async () => {
    setLoading(true);
    try {
      const initial: MissionNextResponse | undefined = route?.params?.initialData;
      if (initial) {
        normalizeAndSet(initial);
        // biar kalau balik lagi ke screen ini gak “nyangkut” initialData
        navigation.setParams({ initialData: undefined });
        return;
      }

      const res = await missionService.next();
      normalizeAndSet(res);
    } finally {
      setLoading(false);
    }
  }, [navigation, route?.params?.initialData]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  const qNumber = question?.questionNumber ?? 1;
  const totalQ = mission?.totalQuestions ?? 0;
  const score = progress?.currentScore ?? 0;

  const progressPct = useMemo(() => {
    if (!totalQ) return 0;
    const cur = Math.min(qNumber, totalQ);
    return Math.round((cur / totalQ) * 100);
  }, [qNumber, totalQ]);

  // ====== sizing opsi 3 sebaris ======
  const { width } = Dimensions.get("window");
  const GAP = theme.spacing.sm;
  const H_PADDING = theme.spacing.lg;
  const OPTION_W = (width - H_PADDING * 2 - GAP * 2) / 3;

  const onSelect = async (idx: number) => {
    if (!question || !mission || submitting) return;

    setSelectedIndex(idx);
    setSubmitting(true);

    try {
      const payload = {
        questionNumber: question.questionNumber,
        selectedOptionIndex: idx,
      };

      const ans: MissionAnswerResponse = await missionService.answer(mission.slug, payload);

      // show feedback dulu (ini yang bikin “Correct/Wrong” muncul)
      setChecked({
        isCorrect: !!ans.isCorrect,
        correctOptionIndex: Number(ans.correctOptionIndex ?? 0),
        show: true,
      });

      // update score di UI biar real-time
      setProgress((prev) => ({
        currentQuestionNumber: question.questionNumber,
        questionsAnswered: prev?.questionsAnswered ?? 0,
        currentScore: Number(ans.currentScore ?? prev?.currentScore ?? 0),
      }));

      // kalau completed, jangan auto-next. Next button bakal navigate result.
      if (ans.completed) return;
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = async () => {
    if (!mission || !question) return;

    // kalau sudah selesai → ke Result (sesuai MissionResultScreen kamu)
    // (ans.completed ngga kita simpan, jadi paling aman: hit /next, tapi di backend kamu
    // biasanya completed sudah ditrigger di answer. Untuk UX: kita navigate result kalau qNumber == totalQ dan sudah checked)
    // Lebih robust: panggil /next dan kalau mission null => completed.
    setLoading(true);
    try {
      const res = await missionService.next();

      if ((res as any)?.mission === null) {
        // ambil result dari terakhir answer seharusnya lebih akurat, tapi karena kamu belum simpan,
        // kita fallback: score yang ada + totalQ
        const percentage = totalQ ? Math.round((score / totalQ) * 100) : 0;
        navigation.navigate("MissionResult", {
          percentage,
          finalScore: score,
          totalQuestions: totalQ,
        });
        return;
      }

      normalizeAndSet(res);
    } finally {
      setLoading(false);
    }
  };

  // handle “all completed”
  if (!loading && mission === null) {
    return (
      <View style={styles.screen}>
        <AnimatedAppBackground />
        <View style={[styles.wrap, { paddingTop: insets.top + theme.spacing.lg }]}>
          <View style={styles.card}>
            <Text style={styles.title}>Mission</Text>
            <Text style={styles.subtitle}>All missions completed!</Text>
          </View>
        </View>
      </View>
    );
  }

  const opts = question?.options ?? [];

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <ScrollView
        style={styles.wrap}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding, paddingTop: insets.top + theme.spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{mission?.title ?? "Mission"}</Text>
          {!!mission?.description && <Text style={styles.subtitle}>{mission.description}</Text>}

          <View style={styles.progressRow}>
            <Text style={styles.metaText}>
              Q{qNumber}/{totalQ || "?"} • Score {score}
            </Text>
            <Text style={styles.metaText}>{progressPct}%</Text>
          </View>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Question */}
        <View style={[styles.card, { marginTop: theme.spacing.sm }]}>
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 10 }}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading question...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.qTitle}>{question?.questionText ?? ""}</Text>
              <Text style={styles.qHint}>Tap one option to answer.</Text>
            </>
          )}
        </View>

        {/* Options */}
        <View style={[styles.optionsRow, { marginTop: theme.spacing.sm, gap: GAP }]}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading options...</Text>
            </View>
          ) : (
            opts.slice(0, 3).map((optStr, idx) => {
              const selected = selectedIndex === idx;

              // kalau string option berupa URL gambar → tampilkan image
              const showImage = isImageLike(optStr);

              // border warna kalau sudah checked:
              // - option yang dipilih: hijau/merah
              // - correct option: highlight ungu/hijau
              const showChecked = !!checked?.show;
              const isCorrectPick = showChecked && selected && checked?.isCorrect;
              const isWrongPick = showChecked && selected && !checked?.isCorrect;
              const isCorrectOption = showChecked && checked?.correctOptionIndex === idx;

              return (
                <Pressable
                  key={`${qNumber}-${idx}`} // ✅ key aman (nggak mungkin duplicate)
                  onPress={() => onSelect(idx)}
                  disabled={submitting || !!checked?.show}
                  style={({ pressed }) => [
                    {
                      width: OPTION_W,
                      borderRadius: theme.radius.lg,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.55)",
                      backgroundColor: "rgba(255,255,255,0.45)",
                    },
                    selected ? { borderColor: "rgba(124, 58, 237, 0.55)", borderWidth: 2 } : null,
                    showChecked && isCorrectOption ? { borderColor: "rgba(124, 58, 237, 0.85)", borderWidth: 2 } : null,
                    showChecked && isCorrectPick ? { borderColor: "rgba(22, 163, 74, 0.85)", borderWidth: 2 } : null,
                    showChecked && isWrongPick ? { borderColor: "rgba(220, 38, 38, 0.85)", borderWidth: 2 } : null,
                    pressed && !submitting ? { transform: [{ scale: 0.99 }] } : null,
                    submitting ? { opacity: 0.75 } : null,
                  ]}
                >
                  {showImage ? (
                    <Image
                      source={{ uri: optStr }}
                      style={{ width: "100%", height: OPTION_W, resizeMode: "cover" }}
                    />
                  ) : (
                    <View style={{ width: "100%", height: OPTION_W, alignItems: "center", justifyContent: "center", padding: 8 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: "900", textAlign: "center", fontSize: 12 }}>
                        {optStr}
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
            height: FOOTER_HEIGHT,
          },
        ]}
      >
        <View style={styles.footerCard}>
          <Button
            title={loading ? "Loading..." : checked?.show ? "Next" : submitting ? "Submitting..." : "Next"}
            onPress={onNext}
            disabled={!canNext || loading}
          />

          {/* ✅ feedback bener/salah muncul lagi */}
          <Text style={styles.footerHint}>
            {submitting
              ? "Checking your answer..."
              : checked?.show
              ? checked.isCorrect
                ? "✅ Correct!"
                : `❌ Wrong — correct is option #${checked.correctOptionIndex + 1}`
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
  wrap: { flex: 1, paddingHorizontal: theme.spacing.lg },
  content: { paddingBottom: 24 },

  card: {
    padding: theme.card.padding,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: theme.card.borderRadius,
    backgroundColor: "rgba(255,255,255,0.45)", // ✅ lebih “transparent” kaya Material/Exam
  },

  title: { fontWeight: "900", color: theme.colors.text, textAlign: "center", fontSize: 18 },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    opacity: 0.9,
  },

  progressRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: { color: theme.colors.muted, fontSize: 12, opacity: 0.85, fontWeight: "800" },
  progressBg: {
    marginTop: theme.spacing.sm,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(124, 58, 237, 0.9)",
  },

  qTitle: { fontWeight: "900", color: theme.colors.text, fontSize: 14 },
  qHint: { marginTop: 4, color: theme.colors.muted, fontSize: 12, opacity: 0.85, fontWeight: "700" },

  optionsRow: { flexDirection: "row", justifyContent: "space-between" },

  loadingBox: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 8, color: theme.colors.muted, fontWeight: "800" },

  footerWrap: { position: "absolute" },
  footerCard: {
    padding: theme.card.padding,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: theme.card.borderRadius,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  footerHint: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.muted,
    opacity: 0.9,
    fontWeight: "800",
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
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.22)",
  },
  chipText: { fontWeight: "900", color: theme.colors.text },
});