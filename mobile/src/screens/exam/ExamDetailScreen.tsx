import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HtmlContent from "../../components/HtmlContent";
import Button from "../../components/Button";
import theme from "../../styles/theme";
import { examService } from "../../services/exam.service";
import type { ExamDetailResponse } from "../../types/dtos";
import { QuestionType } from "../../types/enums";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import PurpleLights from "../../components/PurpleLights";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamDetail">;

export default function ExamDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [data, setData] = useState<ExamDetailResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();

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

  if (!data)
    return (
      <View style={{ flex: 1 }}>
        <AnimatedAppBackground />
        <View style={{ padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.lg }}>
          <Text style={{ color: "rgba(88, 28, 135, 0.82)" }}>Loading...</Text>
        </View>
      </View>
    );

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <PurpleLights count={12} />

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingTop: insets.top + 64,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image source={require("../../../assets/img/clock.png")} style={styles.headerIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{data.exam.title}</Text>
              {!!data.exam.description && <Text style={styles.desc}>{data.exam.description}</Text>}
            </View>
          </View>
        </View>

        {data.exam.htmlContent ? (
          <>
            <View style={{ height: theme.spacing.lg }} />
            <View style={styles.contentCard}>
              <HtmlContent html={data.exam.htmlContent} />
            </View>
          </>
        ) : null}

        <View style={{ height: theme.spacing.lg }} />
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
                placeholderTextColor="rgba(88, 28, 135, 0.46)"
              />
            ) : (
              (q.options ?? []).map((opt, idx) => {
                const selected = answers[String(q.questionNumber)] === String(idx);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setAnswers((prev) => ({ ...prev, [String(q.questionNumber)]: String(idx) }))}
                    style={[styles.opt, selected && styles.optSelected, busy && { opacity: 0.7 }]}
                    disabled={busy}
                  >
                    <Text style={[styles.optTxt, selected && styles.optTxtSelected]}>{opt}</Text>
                  </Pressable>
                );
              })
            )}
          </View>
        ))}

        <Button title={busy ? "Submitting..." : "Submit Exam"} onPress={submit} disabled={busy || !canSubmit} />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerCard: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 44, height: 44, marginRight: theme.spacing.md },
  title: { fontSize: 18, fontWeight: "800", color: "rgba(88, 28, 135, 0.94)", lineHeight: 24 },
  desc: { marginTop: 6, color: "rgba(88, 28, 135, 0.72)", lineHeight: 19, fontSize: 13 },

  contentCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },

  qCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    marginBottom: theme.spacing.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  qTitle: { fontWeight: "900", marginBottom: 6, color: "rgba(88, 28, 135, 0.86)" },
  qText: { fontWeight: "700", color: "rgba(17,17,17,0.82)", lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.35)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.45)",
    color: "rgba(17,17,17,0.84)",
  },
  opt: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.22)",
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  optSelected: { borderColor: "rgba(88, 28, 135, 0.55)", backgroundColor: "rgba(167, 139, 250, 0.16)" },
  optTxt: { fontWeight: "700", color: "rgba(17,17,17,0.78)" },
  optTxtSelected: { color: "rgba(88, 28, 135, 0.92)" },
});