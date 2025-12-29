import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { examService } from "../../services/exam.service";
import type { ExamSubmissionHistoryItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import PurpleLights from "../../components/PurpleLights";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamHistory">;

export default function ExamHistoryScreen({ route }: Props) {
  const { slug } = route.params;
  const [items, setItems] = useState<ExamSubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const title = useMemo(() => "Your submissions", []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await examService.history(slug));
    } catch (e: any) {
      // Don't fail silently — most common cause is 401 (token missing/expired) or wrong API_BASE_URL.
      const message =
        typeof e?.message === "string"
          ? e.message
          : "Failed to load submissions.";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <PurpleLights count={10} />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Couldn't load submissions</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingTop: insets.top + 64,
          paddingBottom: theme.spacing.xl,
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.title}>Submission #{item.id}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>
                  {item.score}/{item.totalQuestions}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              Score {item.score}/{item.totalQuestions} • {new Date(item.submittedAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>All your past attempts for this exam</Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No submissions yet</Text>
              <Text style={styles.emptyText}>Take the exam and submit to see your history here.</Text>
            </View>
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerCard: {
    ...theme.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(88, 28, 135, 0.96)",
  },
  headerSub: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
  },
  errorBox: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(255, 82, 82, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.25)",
  },
  errorTitle: { fontWeight: "900", color: theme.colors.text },
  errorText: { marginTop: 4, color: theme.colors.muted, fontSize: 12 },
  card: {
    ...theme.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontWeight: "900", color: "rgba(88, 28, 135, 0.96)", fontSize: 15 },
  meta: { opacity: 0.62, marginTop: 6, fontSize: 12.5, color: theme.colors.muted },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(196, 181, 253, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.55)",
  },
  pillText: {
    fontWeight: "900",
    color: "rgba(88, 28, 135, 0.92)",
    fontSize: 12,
  },
  emptyWrap: {
    ...theme.card,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  emptyTitle: {
    fontWeight: "900",
    color: "rgba(88, 28, 135, 0.96)",
    fontSize: 15,
  },
  emptyText: { marginTop: 6, color: theme.colors.muted, fontSize: 13 },
  loadingText: { color: "rgba(88, 28, 135, 0.75)", marginTop: 12 },
});