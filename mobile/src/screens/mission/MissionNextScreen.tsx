import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionNextResponse } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionNext">;

export default function MissionNextScreen({ navigation }: Props) {
  const [data, setData] = useState<MissionNextResponse | null>(null);
  const [busy, setBusy] = useState(false);

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
    const q = (data as any).currentQuestion;

    setBusy(true);
    try {
      const res = await missionService.answer(mission.slug, {
        questionNumber: q.questionNumber,
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

  if (!data) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;

  // all completed
  if ((data as any).mission === null) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.title}>Missions</Text>
        <Text>{(data as any).message ?? "All missions completed!"}</Text>
        <View style={{ height: 16 }} />
        <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
          <Text style={styles.linkTxt}>View completion history</Text>
        </Pressable>
      </View>
    );
  }

  const mission = (data as any).mission;
  const q = (data as any).currentQuestion;
  const progress = (data as any).progress;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>{mission.title}</Text>
      {!!mission.description && <Text style={{ opacity: 0.75 }}>{mission.description}</Text>}

      <View style={{ height: 12 }} />
      <Text style={styles.meta}>
        Q{q.questionNumber}/{mission.totalQuestions} • Score: {progress.currentScore}
      </Text>

      <View style={{ height: 12 }} />
      <Text style={styles.qText}>{q.questionText}</Text>

      <View style={{ height: 10 }} />
      {q.options.map((opt: string, idx: number) => (
        <Pressable
          key={idx}
          style={[styles.opt, busy && { opacity: 0.6 }]}
          onPress={() => answer(idx)}
          disabled={busy}
        >
          <Text style={{ fontWeight: "700" }}>{opt}</Text>
        </Pressable>
      ))}

      <View style={{ height: 16 }} />
      <Pressable style={styles.link} onPress={() => navigation.navigate("MissionHistory")}>
        <Text style={styles.linkTxt}>View completion history</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900" },
  meta: { opacity: 0.65, fontSize: 12 },
  qText: { fontSize: 16, fontWeight: "800" },
  opt: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 10 },
  link: { paddingVertical: 10 },
  linkTxt: { fontWeight: "800" },
});