import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Image, ActivityIndicator } from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionNext">;

export default function MissionNextScreen({ navigation }: Props) {
  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [imgState, setImgState] = useState<Record<number, { loading: boolean; error: boolean }>>({});

  // Derive current question safely for hooks usage (even when data is null)
  const q = useMemo(() => {
    return (data as any)?.currentQuestion ?? null;
  }, [data]);

  const optionImages = useMemo(() => {
    const opts: unknown = q?.options;
    if (!Array.isArray(opts)) return [] as string[];
    return opts.filter((o): o is string => typeof o === "string");
  }, [q]);

  // Reset image state when question changes
  useEffect(() => {
    const qn = (q as any)?.questionNumber;
    if (!qn) return;
    setImgState({});
  }, [q]);

  async function load() {
    const res = await missionService.next();
    setData(res);
  }

  useEffect(() => {
    load();
  }, []);

  async function answer(selectedOptionIndex: number) {
    if (!data || (data as any).mission === null) return;
    const mission = (data as any).mission;
    const cq = (data as any).currentQuestion;

    setBusy(true);
    try {
      const res = await missionService.answer(mission.slug, {
        questionNumber: cq.questionNumber,
        selectedOptionIndex,
      });

      if (res.completed) {
        navigation.navigate("MissionResult", {
          percentage: res.percentage ?? 0,
          finalScore: res.finalScore ?? 0,
          totalQuestions: res.totalQuestions ?? 0,
        });
        // refresh for next mission
        const next = await missionService.next();
        setData(next);
      } else if (res.nextQuestion) {
        setData({
          mission,
          currentQuestion: res.nextQuestion,
          progress: {
            currentQuestionNumber: res.nextQuestion.questionNumber,
            questionsAnswered: (data as any).progress.questionsAnswered + 1,
            currentScore: res.currentScore,
          },
        } as any);
      }
    } catch (e: any) {
      Alert.alert("Submit failed", e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!data)
    return (
      <View style={{ flex: 1 }}>
        <AnimatedAppBackground />
        <View style={{ padding: 16 }}>
          <Text>Loading...</Text>
        </View>
      </View>
    );

  // all completed
  if ((data as any).mission === null) {
    return (
      <View style={styles.screen}>
        <AnimatedAppBackground />
        <View style={styles.wrap}>
          <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image source={require("../../../assets/img/mission-completed.png")} style={styles.headerIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Missions</Text>
              <Text style={styles.desc}>{(data as any).message ?? "All missions completed!"}</Text>
            </View>
          </View>

          <View style={{ height: theme.spacing.md }} />
          <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
            <Text style={styles.linkTxt}>View completion history</Text>
          </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const mission = (data as any).mission;
  const progress = (data as any).progress;
  if (!q) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;
  const pct = mission.totalQuestions ? Math.min(1, q.questionNumber / mission.totalQuestions) : 0;

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <View style={styles.wrap}>
        <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Image source={require("../../../assets/img/mission.png")} style={styles.headerIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{mission.title}</Text>
            {!!mission.description && <Text style={styles.desc}>{mission.description}</Text>}
          </View>
        </View>

        <View style={{ height: theme.spacing.md }} />
        <Text style={styles.meta}>
          Q{q.questionNumber}/{mission.totalQuestions} • Score: {progress.currentScore}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      </View>

      <View style={{ height: theme.spacing.lg }} />
      <Text style={styles.qText}>{q.questionText}</Text>

      <View style={{ height: 10 }} />
      {optionImages.every((o) => /^https?:\/\//.test(o)) ? (
        <View style={styles.grid}>
          {optionImages.map((uri, idx) => (
            <Pressable
              key={idx}
              style={[styles.imgOpt, busy && { opacity: 0.6 }]}
              onPress={() => answer(idx)}
              disabled={busy}
            >
              <Image
                source={{ uri }}
                style={styles.img}
                resizeMode="cover"
                onLoadStart={() =>
                  setImgState((prev) => ({ ...prev, [idx]: { loading: true, error: prev[idx]?.error ?? false } }))
                }
                onLoadEnd={() =>
                  setImgState((prev) => ({ ...prev, [idx]: { loading: false, error: prev[idx]?.error ?? false } }))
                }
                onError={() =>
                  setImgState((prev) => ({ ...prev, [idx]: { loading: false, error: true } }))
                }
              />
              {imgState[idx]?.loading ? (
                <View style={styles.imgOverlay}>
                  <ActivityIndicator />
                  <Text style={styles.imgOverlayText}>Loading image…</Text>
                </View>
              ) : null}

              {imgState[idx]?.error ? (
                <View style={styles.imgOverlay}>
                  <Text style={styles.imgOverlayText}>Failed to load</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : (
        q.options.map((opt: string, idx: number) => (
          <Pressable
            key={idx}
            style={[styles.opt, busy && { opacity: 0.6 }]}
            onPress={() => answer(idx)}
            disabled={busy}
          >
            <Text style={styles.optTxt}>{String(opt)}</Text>
          </Pressable>
        ))
      )}

        <View style={{ height: 16 }} />
        <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
          <Text style={styles.linkTxt}>View completion history</Text>
        </Pressable>
      </View>
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
  meta: { opacity: 0.65, fontSize: 12, marginTop: 8 },
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
  qText: { fontSize: 16, fontWeight: "800", marginTop: 8, color: theme.colors.text },
  opt: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    backgroundColor: theme.colors.card,
  },
  optTxt: { fontWeight: "700", color: theme.colors.text },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imgOpt: {
    width: "48%",
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
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  imgOverlayText: { marginTop: 8, fontWeight: "800", color: theme.colors.text },
  link: { paddingVertical: 10 },
  linkTxt: { fontWeight: "800", color: theme.colors.accent },
});