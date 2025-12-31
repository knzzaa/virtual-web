// src/screens/mission/MissionNextScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";

import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import Button from "../../components/Button";
import { missionService } from "../../services/mission.service";
import { API_BASE_URL } from "../../config/env";

type FeedbackKind = "correct" | "wrong";
type FeedbackState = { kind: FeedbackKind; text: string } | null;

const DANGER = "rgba(239,68,68,1)";
const SUCCESS = theme.colors.success;

function isLikelyUrl(s: string) {
  return /^https?:\/\//i.test(s) || /^file:\/\//i.test(s);
}
function makeAbsoluteMaybe(uri: string) {
  if (!uri) return uri;
  if (isLikelyUrl(uri)) return uri;
  // kalau backend ngirim "/img/clock.png" → jadi "http://ip:3000/img/clock.png"
  if (uri.startsWith("/")) return `${API_BASE_URL}${uri}`;
  return uri;
}
function toImageSource(x: any) {
  if (!x) return undefined;
  if (typeof x === "string") return { uri: makeAbsoluteMaybe(x) };
  if (typeof x === "object" && x.uri) return { uri: makeAbsoluteMaybe(x.uri) };
  return x;
}

// normalize options: support object options & string[] options
function normalizeOptions(raw: any[]): Array<{
  key: string;
  index: number;
  label?: string;
  image?: any;
  raw: any;
}> {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt, index) => {
    // object option
    if (opt && typeof opt === "object") {
      const id =
        opt.id ??
        opt.optionId ??
        opt.choiceId ??
        opt.answerId ??
        opt.key ??
        opt.value ??
        null;

      const img =
        opt.image ??
        opt.imageUrl ??
        opt.imgUrl ??
        opt.url ??
        opt.picture ??
        opt.imageUri ??
        opt.thumbnail ??
        undefined;

      const label = opt.label ?? opt.text ?? opt.title ?? opt.name ?? undefined;

      return {
        key: String(id ?? index), // ✅ fix duplicate key ""
        index,
        label: label ? String(label) : undefined,
        image: img,
        raw: opt,
      };
    }

    // string option (bisa text atau url)
    const s = String(opt);
    const image = isLikelyUrl(s) || s.startsWith("/") ? s : undefined;
    const label = image ? undefined : s;

    return {
      key: `opt-${index}`,
      index,
      label,
      image,
      raw: opt,
    };
  });
}

export default function MissionNextScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [slug, setSlug] = useState<string>("");
  const [missionTitle, setMissionTitle] = useState<string>("Mission");
  const [missionSubtitle, setMissionSubtitle] = useState<string>("");

  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(0); // 0-based
  const [score, setScore] = useState<number>(0);

  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>("Which one is correct?");
  const [rawOptions, setRawOptions] = useState<any[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // anim buat banner biar kerasa “toast web”
  const anim = useRef(new Animated.Value(0)).current;
  const showBanner = useCallback(() => {
    anim.stopAnimation();
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const hideBanner = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const loadNext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await missionService.next();

      // handle union type: { mission: null, message }
      if ((res as any)?.mission === null) {
        // balik ke home (biar konsisten)
        navigation.navigate("MissionHome");
        return;
      }

      const mission = (res as any)?.mission ?? (res as any)?.data?.mission ?? null;
      const currentQuestion =
        (res as any)?.currentQuestion ??
        (res as any)?.question ??
        (res as any)?.data?.currentQuestion ??
        null;

      const progress = (res as any)?.progress ?? (res as any)?.data?.progress ?? null;

      setSlug(String(mission?.slug ?? ""));
      setMissionTitle(String(mission?.title ?? "Mission"));
      setMissionSubtitle(String(mission?.description ?? ""));

      const total = Number(mission?.totalQuestions ?? 0);
      setTotalQuestions(total);

      const qNum = Number(
        currentQuestion?.questionNumber ??
          progress?.currentQuestionNumber ??
          1
      );
      setQuestionNumber(qNum);

      // 0-based index untuk progress bar
      setQIndex(Math.max(0, qNum - 1));

      setScore(Number(progress?.currentScore ?? 0));

      const qText = String(
        currentQuestion?.questionText ??
          currentQuestion?.prompt ??
          currentQuestion?.text ??
          "Which one is correct?"
      );
      setPrompt(qText);

      const opts = currentQuestion?.options ?? [];
      setRawOptions(Array.isArray(opts) ? opts : []);

      // reset selection / feedback per soal
      setSelectedIndex(null);
      setCorrectIndex(null);
      setFeedback(null);
      hideBanner();
    } finally {
      setLoading(false);
    }
  }, [navigation, hideBanner]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  const progressPct = useMemo(() => {
    if (!totalQuestions) return 0;
    const cur = Math.min(qIndex + 1, totalQuestions);
    return Math.round((cur / totalQuestions) * 100);
  }, [qIndex, totalQuestions]);

  const options = useMemo(() => normalizeOptions(rawOptions).slice(0, 3), [rawOptions]);

  // sizing 3 sebaris
  const { width } = Dimensions.get("window");
  const GAP = theme.spacing.sm;
  const H_PADDING = theme.spacing.lg;
  const OPTION_W = (width - H_PADDING * 2 - GAP * 2) / 3;

  const footerSafeBottom = tabBarHeight + insets.bottom + theme.spacing.sm;

  const onSelect = async (optIndex: number) => {
    if (submitting) return;

    setSelectedIndex(optIndex);
    setSubmitting(true);

    try {
      const payload = {
        questionNumber: questionNumber,
        selectedOptionIndex: optIndex,
      };

      const ans = await missionService.answer(slug, payload);

      const isCorrect = !!(ans as any)?.isCorrect;
      const corr = Number((ans as any)?.correctOptionIndex ?? -1);
      setCorrectIndex(Number.isFinite(corr) && corr >= 0 ? corr : null);

      const newScore = Number((ans as any)?.currentScore ?? score);
      setScore(newScore);

      // ✅ tampilkan banner seperti web
      setFeedback({
        kind: isCorrect ? "correct" : "wrong",
        text: isCorrect ? "Excellent!" : "Wrong :(",
      });
      showBanner();

      const completed = !!(ans as any)?.completed;
      if (completed) {
        const percentage = Number((ans as any)?.percentage ?? Math.round((newScore / (totalQuestions || 1)) * 100));
        const finalScore = Number((ans as any)?.finalScore ?? newScore);
        const totalQ = Number((ans as any)?.totalQuestions ?? totalQuestions);

        setTimeout(() => {
          hideBanner();
          navigation.navigate("MissionResult", {
            percentage,
            finalScore,
            totalQuestions: totalQ,
          });
        }, 700);
        return;
      }

      // delay sedikit supaya user sempet lihat “Excellent/Wrong”
      setTimeout(async () => {
        hideBanner();
        await loadNext();
      }, 700);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      {/* container paddingTop biar gak ketutup header (match Materials/Exams) */}
      <View style={[styles.page, { paddingTop: headerHeight + theme.spacing.md }]}>
        <ScrollView
          style={styles.wrap}
          contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.card}>
            <View style={styles.headerTop}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>✨</Text>
              </View>
            </View>

            <Text style={styles.title}>{missionTitle}</Text>
            {!!missionSubtitle && <Text style={styles.subtitle}>{missionSubtitle}</Text>}

            <View style={styles.progressRow}>
              <Text style={styles.metaText}>
                Q{Math.min(qIndex + 1, totalQuestions || qIndex + 1)}/{totalQuestions || "?"} • Score {score}
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
              options.map((opt) => {
                const selected = selectedIndex === opt.index;
                const isCorrectOpt = correctIndex !== null && correctIndex === opt.index;
                const isWrongSelected = selected && correctIndex !== null && correctIndex !== opt.index;

                const img = toImageSource(opt.image);

                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => onSelect(opt.index)}
                    disabled={submitting}
                    style={({ pressed }) => [
                      styles.optionBase,
                      { width: OPTION_W },
                      selected ? styles.optionSelected : null,
                      isCorrectOpt ? styles.optionCorrect : null,
                      isWrongSelected ? styles.optionWrong : null,
                      pressed && !submitting ? { transform: [{ scale: 0.99 }] } : null,
                      submitting ? { opacity: 0.8 } : null,
                    ]}
                  >
                    {img ? (
                      <Image
                        source={img}
                        style={{ width: "100%", height: OPTION_W, resizeMode: "cover" }}
                      />
                    ) : (
                      <View style={[styles.noImg, { height: OPTION_W }]}>
                        <Text style={styles.noImgText}>No image</Text>
                      </View>
                    )}

                    {!!opt.label && <Text style={styles.optionLabel}>{opt.label}</Text>}
                  </Pressable>
                );
              })
            )}
          </View>

          {/* Footer Card (non-absolute supaya scroll gak rusak) */}
          <View style={{ height: theme.spacing.lg }} />
          <View style={[styles.footerCard, { marginBottom: footerSafeBottom }]}>
            <Button title={submitting ? "Submitting..." : "Next"} onPress={() => {}} disabled />

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
        </ScrollView>

        {/* ✅ Feedback banner ala web (green/red bar) */}
        {feedback ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedbackBar,
              {
                bottom: footerSafeBottom,
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                ],
                backgroundColor:
                  feedback.kind === "correct" ? "rgba(22,163,74,0.16)" : "rgba(239,68,68,0.14)",
                borderColor:
                  feedback.kind === "correct" ? "rgba(22,163,74,0.35)" : "rgba(239,68,68,0.28)",
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                { color: feedback.kind === "correct" ? SUCCESS : DANGER },
              ]}
            >
              {feedback.text}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flex: 1 },

  wrap: { flex: 1, paddingHorizontal: theme.spacing.lg },
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

  optionsRow: { flexDirection: "row", justifyContent: "space-between" },

  optionBase: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    backgroundColor: theme.colors.card,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: "rgba(124, 58, 237, 0.55)",
  },
  optionCorrect: {
    borderWidth: 2,
    borderColor: "rgba(22,163,74,0.65)",
  },
  optionWrong: {
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.55)",
  },

  noImg: { alignItems: "center", justifyContent: "center" },
  noImgText: { color: theme.colors.muted, fontWeight: "800" },

  optionLabel: {
    padding: theme.spacing.sm,
    textAlign: "center",
    fontWeight: "800",
    color: theme.colors.text,
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

  feedbackBar: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  feedbackText: {
    fontWeight: "900",
  },
});