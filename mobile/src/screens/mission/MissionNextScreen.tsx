import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

// NOTE: Jangan panggil hook conditional.
// Kita bikin wrapper yang aman: kalau paketnya ga ada, height = 0.
let useBottomTabBarHeightFn: null | (() => number) = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useBottomTabBarHeightFn = require("@react-navigation/bottom-tabs").useBottomTabBarHeight;
} catch {
  useBottomTabBarHeightFn = null;
}

type Props = NativeStackScreenProps<MissionStackParamList, "MissionNext">;

type ImgState = Record<number, { loading: boolean; error: boolean }>;

export default function MissionNextScreen({ navigation, route }: Props) {
  // ✅ hooks MUST be stable: always call useState/useMemo/useEffect in same order.
  // Untuk tabBarHeight: kalau fn-nya ga ada, set 0 via state supaya nggak conditional hook.
  const [tabBarHeight] = useState(() => {
    try {
      return useBottomTabBarHeightFn ? useBottomTabBarHeightFn() : 0;
    } catch {
      return 0;
    }
  });

  const [data, setData] = useState<MissionNextResponse | null>(() => route.params?.initialData ?? null);
  const [busy, setBusy] = useState(false);

  // UI/UX states
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any | null>(null);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correctOptionIndex?: number; isCorrect?: boolean } | null>(null);

  const [imgState, setImgState] = useState<ImgState>({});

  // Derive current question safely
  const q = useMemo(() => {
    return (data as any)?.currentQuestion ?? null;
  }, [data]);

  const mission = (data as any)?.mission ?? null;
  const progress = (data as any)?.progress ?? null;

  const optionImages = useMemo(() => {
    const opts: unknown = q?.options;
    if (!Array.isArray(opts)) return [] as string[];
    return opts.filter((o): o is string => typeof o === "string");
  }, [q]);

  const isImageMode = useMemo(() => {
    return optionImages.length > 0 && optionImages.every((o) => /^https?:\/\//.test(o));
  }, [optionImages]);

  // Reset UI states when question changes
  useEffect(() => {
    const qn = (q as any)?.questionNumber;
    if (!qn) return;
    setSelectedIndex(null);
    setLocked(false);
    setPendingNextQuestion(null);
    setPendingScore(null);
    setFeedback(null);
    setImgState({});
  }, [q]);

  async function load() {
    const res = await missionService.next();
    setData(res);
  }

  // ✅ only fetch if no initialData
  useEffect(() => {
    if (!route.params?.initialData) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildGridData<T extends { id: string }>(items: T[]) {
    if (items.length % 2 === 1) return [...items, { id: "__spacer__" } as T];
    return items;
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

  const imageItems = useMemo(() => {
    return buildGridData(optionImages.map((uri, idx) => ({ id: String(idx), uri, idx })));
  }, [optionImages]);

  const textItems = useMemo(() => {
    const opts: unknown = q?.options;
    const arr = Array.isArray(opts) ? opts : [];
    return arr.map((val: any, idx: number) => ({ id: String(idx), label: String(val), idx }));
  }, [q]);

  const canNext = locked && !!pendingNextQuestion && !busy;

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

        {/* QUESTION */}
        <Text style={styles.qText}>{q.questionText}</Text>
        <Text style={styles.hintText}>Tap one option to answer{canNext ? ", then press Next" : ""}.</Text>

        <View style={{ height: 12 }} />

        {/* CONTENT */}
        {isImageMode ? (
          <FlatList
            data={imageItems}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: tabBarHeight + 110,
            }}
            renderItem={({ item }: any) => {
              if (item.id === "__spacer__") return <View style={{ flex: 1 }} />;

              const idx: number = item.idx;
              const uri: string = item.uri;

              const selected = selectedIndex === idx;

              const showCorrect = locked && typeof correctIdx === "number" && idx === correctIdx;
              const showWrong =
                locked &&
                typeof correctIdx === "number" &&
                selectedIndex === idx &&
                idx !== correctIdx;

              const showOnlySelectedBadge =
                locked && typeof correctIdx !== "number" && selected && feedback?.isCorrect !== undefined;

              return (
                <Pressable
                  style={[
                    styles.imgOpt,
                    selected && styles.optSelected,
                    showCorrect && styles.optCorrect,
                    showWrong && styles.optWrong,
                    busy && { opacity: 0.7 },
                  ]}
                  onPress={() => answer(idx)}
                  disabled={busy || locked}
                >
                  <Image
                    source={{ uri }}
                    style={styles.img}
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
                    onError={() => setImgState((prev) => ({ ...prev, [idx]: { loading: false, error: true } }))}
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

                  {locked && (showCorrect || showWrong || showOnlySelectedBadge) ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {showCorrect
                          ? "Correct"
                          : showWrong
                            ? "Wrong"
                            : feedback?.isCorrect
                              ? "Correct"
                              : "Wrong"}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        ) : (
          <FlatList
            data={textItems}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ gap: 10, paddingBottom: tabBarHeight + 110 }}
            renderItem={({ item }: any) => {
              const idx: number = item.idx;
              const selected = selectedIndex === idx;

              const showCorrect = locked && typeof correctIdx === "number" && idx === correctIdx;
              const showWrong =
                locked && typeof correctIdx === "number" && selectedIndex === idx && idx !== correctIdx;

              return (
                <Pressable
                  style={[
                    styles.opt,
                    selected && styles.optSelected,
                    showCorrect && styles.optCorrect,
                    showWrong && styles.optWrong,
                    busy && { opacity: 0.7 },
                  ]}
                  onPress={() => answer(idx)}
                  disabled={busy || locked}
                >
                  <Text style={styles.optTxt}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
        )}

        {/* links */}
        <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
          <Text style={styles.linkTxt}>View completion history</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHome")}>
          <Text style={styles.linkTxt}>Back to Mission Home</Text>
        </Pressable>
      </View>

      {/* Bottom Fixed CTA */}
      <View style={[styles.bottomCta, { bottom: tabBarHeight + 12 }]}>
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

  qText: { fontSize: 16, fontWeight: "900", marginTop: 8, color: theme.colors.text },
  hintText: { marginTop: 6, fontSize: 12, color: theme.colors.muted, fontWeight: "700", opacity: 0.9 },

  opt: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  optTxt: { fontWeight: "800", color: theme.colors.text },

  imgOpt: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  img: { width: "100%", height: "100%" },

  imgOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  imgOverlayText: { marginTop: 8, fontWeight: "900", color: theme.colors.text },

  optSelected: { borderColor: theme.colors.accent, borderWidth: 2 },
  optCorrect: { borderColor: "#16A34A", borderWidth: 2 },
  optWrong: { borderColor: "#DC2626", borderWidth: 2 },

  badge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  badgeText: { color: "white", fontWeight: "900", fontSize: 12 },

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
});