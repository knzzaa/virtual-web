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
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import Button from "../../components/Button";
import PurpleLights from "../../components/PurpleLights";
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

// ==== Material/Exam palette ====
const TITLE = "rgba(88, 28, 135, 0.94)";
const DESC = "rgba(88, 28, 135, 0.72)";
const META = "rgba(88, 28, 135, 0.76)";
const EMPTY = "rgba(88, 28, 135, 0.82)";

const CARD_BG = "rgba(255,255,255,0.18)";
const CARD_BORDER = "rgba(255,255,255,0.45)";

const PILL_BG = "rgba(167, 139, 250, 0.10)";
const PILL_BORDER = "rgba(167, 139, 250, 0.22)";
const PILL_TEXT = "rgba(88, 28, 135, 0.80)";

export default function MissionNextScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [mission, setMission] = useState<{
    slug: string;
    title: string;
    description?: string | null;
    totalQuestions: number;
  } | null>(null);

  const [question, setQuestion] = useState<{
    questionNumber: number;
    questionText: string;
    options: string[];
  } | null>(null);

  const [progress, setProgress] = useState<{
    currentQuestionNumber: number;
    questionsAnswered: number;
    currentScore: number;
  } | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [checked, setChecked] = useState<{
    isCorrect: boolean;
    correctOptionIndex: number;
    show: boolean;
  } | null>(null);

  const footerBottom = tabBarHeight + insets.bottom + theme.spacing.sm;
  const FOOTER_HEIGHT = 0; // No longer needed - footer is inside ScrollView
  const scrollBottomPadding = footerBottom + theme.spacing.lg;

  // Animation for completion image (hooks must be at top level)
  const imageScale = useSharedValue(0);
  const imageRotate = useSharedValue(0);

  useEffect(() => {
    // Only animate if mission is null (all completed)
    if (mission === null && !loading) {
      // Bounce in animation
      imageScale.value = withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.back(1.3)),
      });

      // Continuous rotation
      imageRotate.value = withRepeat(
        withTiming(360, {
          duration: 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [mission, loading]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: imageScale.value },
      { rotate: `${imageRotate.value}deg` },
    ],
  }));

  const canNext = selectedIndex !== null && !!checked?.show && !submitting;

  const normalizeAndSet = (res: MissionNextResponse) => {
    if ((res as any)?.mission === null) {
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

      setChecked({
        isCorrect: !!ans.isCorrect,
        correctOptionIndex: Number(ans.correctOptionIndex ?? 0),
        show: true,
      });

      setProgress((prev) => ({
        currentQuestionNumber: question.questionNumber,
        questionsAnswered: prev?.questionsAnswered ?? 0,
        currentScore: Number(ans.currentScore ?? prev?.currentScore ?? 0),
      }));

      if (ans.completed) {
        // Mission completed! Navigate to result after 2 seconds
        setTimeout(() => {
          const percentage = ans.percentage ?? 0;
          navigation.navigate("MissionResult", {
            percentage,
            finalScore: ans.finalScore ?? 0,
            totalQuestions: ans.totalQuestions ?? 0,
          });
        }, 2000);
        return;
      }

      // Auto-next after 2 seconds
      setTimeout(() => {
        loadNext();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && mission === null) {
    return (
      <View style={styles.screen}>
        <AnimatedAppBackground />
        <PurpleLights count={12} speed={3.5} />
        <View style={[styles.wrap, { paddingTop: insets.top + 54, justifyContent: "center", alignItems: "center" }]}>
          {/* Animated completion image */}
          <Animated.View style={[styles.completionImageContainer, animatedImageStyle]}>
            <Image
              source={require("../../../assets/img/mission-completed.png")}
              style={styles.completionImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Text below image */}
          <View style={styles.completionCard}>
            <Text style={styles.completionTitle}>All missions completed!</Text>
            <Text style={styles.completionNote}>You've completed all missions. 🎉</Text>
          </View>
        </View>
      </View>
    );
  }

  const opts = question?.options ?? [];

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <PurpleLights count={8} speed={4.5} />

      <ScrollView
        style={styles.wrap}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: scrollBottomPadding,
            paddingTop: insets.top + 54, // ✅ match Material/Exam
          },
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
              const showImage = isImageLike(optStr);

              const showChecked = !!checked?.show;
              const isCorrectPick = showChecked && selected && checked?.isCorrect;
              const isWrongPick = showChecked && selected && !checked?.isCorrect;
              const isCorrectOption = showChecked && checked?.correctOptionIndex === idx;

              return (
                <Pressable
                  key={`${qNumber}-${idx}`}
                  onPress={() => onSelect(idx)}
                  disabled={submitting || !!checked?.show}
                  style={({ pressed }) => [
                    styles.optionBox,
                    { width: OPTION_W, height: OPTION_W },
                    selected ? styles.optionSelected : null,
                    showChecked && isCorrectOption ? styles.optionCorrect : null,
                    showChecked && isCorrectPick ? styles.optionCorrect : null,
                    showChecked && isWrongPick ? styles.optionWrong : null,
                    pressed && !submitting ? { transform: [{ scale: 0.99 }] } : null,
                    submitting ? { opacity: 0.75 } : null,
                  ]}
                >
                  {showImage ? (
                    <Image source={{ uri: optStr }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  ) : (
                    <View style={styles.optionCenter}>
                      <Text style={styles.optionText}>{optStr}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Footer hint - moved inside ScrollView */}
        <View style={[
          styles.footerCard,
          { marginTop: theme.spacing.lg },
          checked?.show && {
            borderColor: checked.isCorrect ? "rgba(22, 163, 74, 0.6)" : "rgba(220, 38, 38, 0.6)",
            backgroundColor: checked.isCorrect ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
            borderWidth: 2,
          }
        ]}>
          {submitting ? (
            <Text style={[styles.footerHint]}>Checking your answer...</Text>
          ) : checked?.show ? (
            <>
              <Text style={[
                styles.footerHint,
                {
                  color: checked.isCorrect ? "rgba(22, 163, 74, 0.95)" : "rgba(220, 38, 38, 0.95)",
                }
              ]}>
                {checked.isCorrect ? "Correct Answer :)" : "Wrong Answer :("}
              </Text>
              {!checked.isCorrect && (
                <Text style={[
                  styles.footerHintSecondary,
                  {
                    color: "rgba(220, 38, 38, 0.95)",
                  }
                ]}>
                  Correct is Option {checked.correctOptionIndex + 1}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.footerHint]}>Select an answer to continue</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: theme.spacing.lg },
  content: { paddingBottom: 24 },

  // ✅ same as Material/Exam card
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

  title: { fontWeight: "800", fontSize: 18, marginBottom: 6, color: TITLE, lineHeight: 24, textAlign: "center" },
  subtitle: { opacity: 0.95, marginBottom: 4, color: DESC, lineHeight: 19, fontSize: 13, textAlign: "center", fontWeight: "700" },
  emptyNote: { color: EMPTY, textAlign: "center", marginTop: 10, fontWeight: "800" },

  progressRow: { marginTop: theme.spacing.md, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: META, fontSize: 12, opacity: 0.9, fontWeight: "800" },
  progressBg: {
    marginTop: theme.spacing.sm,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(88, 28, 135, 0.10)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "rgba(167, 139, 250, 0.85)" },

  qTitle: { fontWeight: "800", color: TITLE, fontSize: 14 },
  qHint: { marginTop: 4, color: DESC, fontSize: 12, opacity: 0.9, fontWeight: "700" },

  optionsRow: { flexDirection: "row", justifyContent: "space-between" },

  loadingBox: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 8, color: DESC, fontWeight: "800" },

  optionBox: {
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_BG,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  optionCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: 10 },
  optionText: { color: TITLE, fontWeight: "900", textAlign: "center", fontSize: 12 },

  optionSelected: { borderColor: "rgba(167, 139, 250, 0.55)", borderWidth: 2 },
  optionCorrect: { borderColor: "rgba(22, 163, 74, 0.85)", borderWidth: 2 },
  optionWrong: { borderColor: "rgba(220, 38, 38, 0.85)", borderWidth: 2 },

  footerWrap: { position: "absolute" },
  footerCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerHint: { fontSize: 16, textAlign: "center", color: "rgba(88, 28, 135, 0.8)", opacity: 0.95, fontWeight: "700", lineHeight: 22 },
  footerHintSecondary: { fontSize: 14, textAlign: "center", opacity: 0.9, fontWeight: "600", lineHeight: 20, marginTop: 8 },

  completionImageContainer: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  completionImage: {
    width: "100%",
    height: "100%",
  },
  completionCard: {
    padding: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 26,
    backgroundColor: CARD_BG,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    alignItems: "center",
    maxWidth: 360,
  },
  completionTitle: {
    fontWeight: "900",
    fontSize: 24,
    color: TITLE,
    textAlign: "center",
    marginBottom: 12,
  },
  completionNote: {
    fontWeight: "700",
    fontSize: 16,
    color: DESC,
    textAlign: "center",
  },
});
