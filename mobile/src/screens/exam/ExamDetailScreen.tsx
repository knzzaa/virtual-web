import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from "react-native";
import HtmlContent from "../../components/HtmlContent";
import Button from "../../components/Button";
import { examService } from "../../services/exam.service";
import type { ExamDetailResponse } from "../../types/dtos";
import { QuestionType } from "../../types/enums";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamDetail">;

export default function ExamDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [data, setData] = useState<ExamDetailResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await examService.detail(slug);
    setData(res);
    setAnswers({});
  }

  useEffect(() => {
    load();
  }, [slug]);

  const canSubmit = useMemo(() => {
    if (!data) return false;
    return data.questions.every((q) => answers[String(q.questionNumber)]?.length);
  }, [data, answers]);

  async function submit() {
    if (!data) return;
    setBusy(true);
    try {
      const res = await examService.submit(slug, { answers });
      navigation.navigate("ExamSubmitResult", {
        slug,
        submissionId: res.submissionId,
        score: res.score,
        totalQuestions: res.totalQuestions,
        percentage: res.percentage,
      });
    } catch (e: any) {
      Alert.alert("Submit failed", e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{data.exam.title}</Text>
      {!!data.exam.description && <Text style={{ opacity: 0.75 }}>{data.exam.description}</Text>}

      {data.exam.htmlContent ? (
        <>
          <View style={{ height: 12 }} />
          <HtmlContent html={data.exam.htmlContent} />
        </>
      ) : null}

      <View style={{ height: 16 }} />
      {data.questions.map((q) => (
        <View key={q.id} style={styles.qCard}>
          <Text style={styles.qTitle}>Q{q.questionNumber}</Text>
          <Text style={styles.qText}>{q.questionText}</Text>

          <View style={{ height: 10 }} />
          {q.questionType === QuestionType.TEXT ? (
            <TextInput
              placeholder="Type your answer..."
              value={answers[String(q.questionNumber)] ?? ""}
              onChangeText={(v) => setAnswers((prev) => ({ ...prev, [String(q.questionNumber)]: v }))}
              style={styles.input}
            />
          ) : (
            (q.options ?? []).map((opt, idx) => {
              const selected = answers[String(q.questionNumber)] === String(idx);
              return (
                <Pressable
                  key={idx}
                  onPress={() => setAnswers((prev) => ({ ...prev, [String(q.questionNumber)]: String(idx) }))}
                  style={[styles.opt, selected && styles.optSelected]}
                >
                  <Text style={{ fontWeight: "700" }}>{opt}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      ))}

      <Button title={busy ? "Submitting..." : "Submit Exam"} onPress={submit} disabled={busy || !canSubmit} />
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", marginBottom: 6 },
  qCard: { padding: 14, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 12 },
  qTitle: { fontWeight: "900", marginBottom: 6 },
  qText: { fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 },
  opt: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 10 },
  optSelected: { borderColor: "#222" },
});