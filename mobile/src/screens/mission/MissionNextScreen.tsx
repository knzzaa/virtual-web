import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionNext">;

type ImgState = Record<number, { loading: boolean; error: boolean }>;

type ToastType = "success" | "error";

export default function MissionNextScreen({ navigation, route }: Props) {
  // ✅ Hindari useBottomTabBarHeight (yang bikin warning hook)
  const TABBAR_ESTIMATE = Platform.OS === "ios" ? 84 : 64;

  // route param optional (biar aman walau type belum diupdate)
  const initialData = (route.params as any)?.initialData as MissionNextResponse | undefined;

  const [data, setData] = useState<MissionNextResponse | null>(() => initialData ?? null);
  const [busy, setBusy] = useState(false);

  // UI state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any | null>(null);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correctOptionIndex?: number; isCorrect?: boolean } | null>(null);
  const [imgState, setImgState] = useState<ImgState>({});

  // Toast
  const [toast, setToast] = useState<{ type: ToastType; text: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const mission = (data as any)?.mission ?? null;
  const progress = (data as any)?.progress ?? null;

  const q = useMemo(() => (data as any)?.currentQuestion ?? null, [data]);

  const optionRaw = useMemo(() => {
    const opts: unknown = q?.options;
    return Array.isArray(opts) ? opts : [];
  }, [q]);

  const optionImages = useMemo(() => {
    return optionRaw.filter((o): o is string => typeof o === "string");
  }, [optionRaw]);

  const isImageMode = useMemo(() => {
    return optionImages.length > 0 && optionImages.every((o) => /^https?:\/\//.test(o));
  }, [optionImages]);

  // reset UI per question
  useEffect(() => {
    const qn = (q as any)?.questionNumber;
    if (!qn) return;

    setSelectedIndex(null);
    setLocked(false);
    setPendingNextQuestion(null);
    setPendingScore(null);
    setFeedback(null);
    setImgState({});
    setToast(null);

    // reset anim
    toastAnim.setValue(0);
  }, [q, toastAnim]);

  async function load() {
    const res = await missionService.next();
    setData(res);
  }

  useEffect(() => {
    if (!initialData) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(type: ToastType, text: string) {
    setToast({ type, text });
    toastAnim.stopAnimation();
    toastAnim.setValue(0);

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 900);
    });
  }

  async function answer(selectedOptionIndex: number) {
    if (!data || (data as any).mission === null) return;
    if (busy || locked) return;

    const missionLocal = (data as any).mission;
    const cq = (data as any).currentQuestion;

    setSelectedIndex(selectedOptionIndex);
    setLocked(true);
    setBusy(true);

    try {
      const res: any = await missionService.answer(missionLocal.slug, {
        questionNumber: cq.questionNumber,
        selectedOptionIndex,
      });

      const correctOptionIndex =
        typeof res?.correctOptionIndex === "number" ? res.correctOptionIndex : undefined;

      const isCorrect =
        typeof res?.isCorrect === "boolean"
          ? res.isCorrect
          : correctOptionIndex !== undefined
            ? selectedOptionIndex === correctOptionIndex
            : undefined;

      setFeedback({ correctOptionIndex, isCorrect });

      if (isCorrect === true) showToast("success", "Excellent!");
      else if (isCorrect === false) showToast("error", "Wrong :(");

      if (res.completed) {
        navigation.navigate("MissionResult", {
          percentage: res.percentage ?? 0,
          finalScore: res.finalScore ?? 0,
          totalQuestions: res.totalQuestions ?? 0,
        });

        // refresh for next mission
        const next = await missionService.next();
        setData(next);
        return;
      }

      if (res.nextQuestion) {
        setPendingNextQuestion(res.nextQuestion);
        setPendingScore(res.currentScore);
      }
    } catch (e: any) {
      Alert.alert("Submit failed", e?.message ?? "Error");
      setSelectedIndex(null);
      setLocked(false);
      setFeedback(null);
      setPendingNextQuestion(null);
      setPendingScore(null);
    } finally {
      setBusy(false);
    }
  }

  function goNext() {
    if (!data || !pendingNextQuestion || !mission) return;

    const prevProgress = (data as any).progress ?? {};
    const nextQ = pendingNextQuestion;

    setData({
      mission,
      currentQuestion: nextQ,
      progress: {
        currentQuestionNumber: nextQ.questionNumber,
        questionsAnswered: (prevProgress.questionsAnswered ?? 0) + 1,
        currentScore: pendingScore ?? prevProgress.currentScore ?? 0,
      },
    } as any);
  }

  // loading state
  if (!data) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedAppBackground />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Loading...</Text>
        </View>
      </View>
    );
  }

  // all completed
  if ((data as any).mission === null) {
    return (
      <SafeAreaView style={styles.screen}>
        <AnimatedAppBackground />
        <View style={styles.wrap}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Image
                source={require("../../../assets/img/mission-completed.png")}
                style={styles.headerIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Missions</Text>
                <Text style={styles.desc}>{(data as any).message ?? "All missions completed!"}</Text>
              </View>
            </View>

            <View style={{ height: theme.spacing.md }} />
            <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
              <Text style={styles.linkTxt}>View completion history</Text>
            </Pressable>

            <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHome")}>
              <Text style={styles.linkTxt}>Back to Mission Home</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!q) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedAppBackground />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Loading...</Text>
        </View>
      </View>
    );
  }

  const totalQ = mission?.totalQuestions ?? 0;
  const pct = totalQ ? Math.min(1, q.questionNumber / totalQ) : 0;
  const pctLabel = `${Math.round(pct * 100)}%`;

  const correctIdx = feedback?.correctOptionIndex;

  const canNext = locked && !!pendingNextQuestion && !busy;

  // --- UI helpers
  function getOptionState(idx: number) {
    const selected = selectedIndex === idx;

    const hasCorrectIndex = typeof correctIdx === "number";
    const isCorrectOption = hasCorrectIndex ? idx === correctIdx : undefined;
    const isSelectedWrong = hasCorrectIndex ? selected && idx !== correctIdx : undefined;

    const onlyBool = !hasCorrectIndex && feedback?.isCorrect !== undefined;
    const selectedIsCorrectByBool = onlyBool ? (selected ? feedback?.isCorrect : undefined) : undefined;

    return {
      selected,
      isCorrectOption,
      isSelectedWrong,
      selectedIsCorrectByBool,
    };
  }

  function renderBadge(idx: number) {
    if (!locked) return null;

    const s = getOptionState(idx);

    // if API gives correctOptionIndex:
    if (typeof correctIdx === "number") {
      if (s.isCorrectOption) return <Pill type="success" text="Correct" />;
      if (s.isSelectedWrong) return <Pill type="error" text="Wrong" />;
      return null;
    }

    // fallback by boolean only (badge only for selected)
    if (s.selectedIsCorrectByBool === true) return <Pill type="success" text="Correct" />;
    if (s.selectedIsCorrectByBool === false) return <Pill type="error" text="Wrong" />;
    return null;
  }

  function optionStyle(idx: number) {
    const s = getOptionState(idx);

    const base = [styles.optCard] as any[];

    if (s.selected) base.push(styles.optSelected);

    if (locked && typeof correctIdx === "number") {
      if (s.isCorrectOption) base.push(styles.optCorrect);
      if (s.isSelectedWrong) base.push(styles.optWrong);
    } else if (locked && s.selected && feedback?.isCorrect === true) {
      base.push(styles.optCorrect);
    } else if (locked && s.selected && feedback?.isCorrect === false) {
      base.push(styles.optWrong);
    }

    if (busy || locked) base.push({ opacity: 0.92 });

    return base;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AnimatedAppBackground />

      <View style={styles.wrap}>
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image source={require("../../../assets/img/mission.png")} style={styles.headerIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{mission.title}</Text>
              {!!mission.description && <Text style={styles.desc}>{mission.description}</Text>}
            </View>
          </View>

          <View style={{ height: theme.spacing.md }} />

          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              Q{q.questionNumber}/{mission.totalQuestions} • Score: {progress?.currentScore ?? 0}
            </Text>
            <Text style={styles.meta}>{pctLabel}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
        </View>

        <View style={{ height: theme.spacing.lg }} />

        {/* QUESTION CARD (web-like) */}
        <View style={styles.questionCard}>
          <Text style={styles.qText}>{q.questionText}</Text>

          <Text style={styles.hintText}>
            Tap one option to answer{canNext ? ", then press Next." : "."}
          </Text>
        </View>

        <View style={{ height: theme.spacing.lg }} />

        {/* OPTIONS */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: TABBAR_ESTIMATE + 140 }}
          showsVerticalScrollIndicator={false}
        >
          {isImageMode ? (
            <View style={styles.grid}>
              {optionImages.map((uri, idx) => {
                const colCount = 2;
                const isLastSingle =
                  optionImages.length % colCount === 1 && idx === optionImages.length - 1;

                return (
                  <Pressable
                    key={String(idx)}
                    style={[
                      optionStyle(idx),
                      styles.optImageWrap,
                      isLastSingle && styles.optLastSingleCentered,
                    ]}
                    onPress={() => answer(idx)}
                    disabled={busy || locked}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.optImage}
                      resizeMode="cover"
                      onLoadStart={() =>
                        setImgState((prev) => ({
                          ...prev,
                          [idx]: { loading: true, error: prev[idx]?.error ?? false },
                        }))
                      }
                      onLoadEnd={() =>
                        setImgState((prev) => ({
                          ...prev,
                          [idx]: { loading: false, error: prev[idx]?.error ?? false },
                        }))
                      }
                      onError={() =>
                        setImgState((prev) => ({
                          ...prev,
                          [idx]: { loading: false, error: true },
                        }))
                      }
                    />

                    {imgState[idx]?.loading ? (
                      <View style={styles.imgOverlay}>
                        <ActivityIndicator />
                        <Text style={styles.imgOverlayText}>Loading…</Text>
                      </View>
                    ) : null}

                    {imgState[idx]?.error ? (
                      <View style={styles.imgOverlay}>
                        <Text style={styles.imgOverlayText}>Failed to load</Text>
                      </View>
                    ) : null}

                    <View style={styles.badgeWrap}>{renderBadge(idx)}</View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {optionRaw.map((val: any, idx: number) => (
                <Pressable
                  key={String(idx)}
                  style={[optionStyle(idx), styles.optTextWrap]}
                  onPress={() => answer(idx)}
                  disabled={busy || locked}
                >
                  <Text style={styles.optTxt}>{String(val)}</Text>
                  <View style={styles.badgeWrapInline}>{renderBadge(idx)}</View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: theme.spacing.md }} />

          {/* links */}
          <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
            <Text style={styles.linkTxt}>View completion history</Text>
          </Pressable>

          <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHome")}>
            <Text style={styles.linkTxt}>Back to Mission Home</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Toast like web */}
      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
            {
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
              opacity: toastAnim,
              bottom: TABBAR_ESTIMATE + 86,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastIcon}>{toast.type === "success" ? "✓" : "✕"}</Text>
          <Text style={styles.toastText}>{toast.text}</Text>
        </Animated.View>
      ) : null}

      {/* Bottom Fixed CTA */}
      <View style={[styles.bottomCta, { bottom: TABBAR_ESTIMATE + 14 }]}>
        <Pressable
          style={[
            styles.nextBtn,
            (!locked || busy) && { opacity: 0.55 },
            locked && !pendingNextQuestion && !busy && { opacity: 0.7 },
          ]}
          disabled={!locked || busy || !pendingNextQuestion}
          onPress={goNext}
        >
          <Text style={styles.nextText}>
            {busy ? "Submitting..." : pendingNextQuestion ? "Next" : "Select an answer"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/** Small pill for Correct/Wrong */
function Pill({ type, text }: { type: ToastType; text: string }) {
  const bg = type === "success" ? "#D1FAE5" : "#FEE2E2";
  const fg = type === "success" ? "#065F46" : "#991B1B";
  const bd = type === "success" ? "#34D399" : "#F87171";
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: bd }]}>
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, padding: theme.spacing.lg },

  headerCard: {
    padding: theme.spacing.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 44, height: 44, marginRight: theme.spacing.md },

  title: { fontSize: 22, fontWeight: "900", color: theme.colors.text },
  desc: { opacity: 0.75, color: theme.colors.muted, marginTop: 6 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { opacity: 0.75, fontSize: 12, marginTop: 8, color: theme.colors.muted, fontWeight: "800" },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
    marginTop: theme.spacing.sm,
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },

  questionCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  qText: { fontSize: 16, fontWeight: "900", color: theme.colors.text, textAlign: "center" },
  hintText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: "700",
    opacity: 0.9,
    textAlign: "center",
  },

  // grid options
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  optCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    overflow: "hidden",
  },
  optSelected: { borderColor: theme.colors.accent, borderWidth: 2 },

  optCorrect: { borderColor: "#16A34A", borderWidth: 2 },
  optWrong: { borderColor: "#DC2626", borderWidth: 2 },

  optImageWrap: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  optLastSingleCentered: {
    width: "48%",
    alignSelf: "center",
  },

  optImage: { width: "100%", height: "100%" },

  imgOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  imgOverlayText: { marginTop: 8, fontWeight: "900", color: theme.colors.text },

  badgeWrap: {
    position: "absolute",
    left: 10,
    bottom: 10,
  },

  optTextWrap: {
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optTxt: { fontWeight: "900", color: theme.colors.text, flex: 1, paddingRight: 10 },
  badgeWrapInline: { marginLeft: 8 },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontWeight: "900", fontSize: 12 },

  link: { paddingVertical: 8 },
  linkTxt: { fontWeight: "900", color: theme.colors.accent },

  bottomCta: { position: "absolute", left: theme.spacing.lg, right: theme.spacing.lg },
  nextBtn: {
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
  },
  nextText: { color: "white", fontWeight: "900" },

  toast: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  toastSuccess: { backgroundColor: "#ECFDF5", borderColor: "#34D399" },
  toastError: { backgroundColor: "#FEF2F2", borderColor: "#F87171" },
  toastIcon: { fontWeight: "900", fontSize: 16, color: theme.colors.text },
  toastText: { fontWeight: "900", color: theme.colors.text },
});