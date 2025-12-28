import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { examService } from "../../services/exam.service";
import type { ExamSubmissionHistoryItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";
import theme from "../../styles/theme";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamHistory">;

export default function ExamHistoryScreen({ route }: Props) {
  const { slug } = route.params;
  const [items, setItems] = useState<ExamSubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await examService.history(slug));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Submission #{item.id}</Text>
            <Text style={styles.meta}>
              Score {item.score}/{item.totalQuestions} • {new Date(item.submittedAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text>No submissions yet.</Text> : <Text>Loading...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.card.padding,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.card.borderRadius,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  title: { fontWeight: "900", color: theme.colors.text },
  meta: { opacity: 0.6, marginTop: 4, fontSize: 12, color: theme.colors.muted },
});