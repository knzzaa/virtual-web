import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionCompletionHistoryItem } from "../../types/dtos";

export default function MissionHistoryScreen() {
  const [items, setItems] = useState<MissionCompletionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await missionService.history();
      setItems(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.missionTitle}</Text>
            <Text style={styles.meta}>
              Score {item.score}/{item.totalQuestions} • {new Date(item.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text>No history.</Text> : <Text>Loading...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 10 },
  title: { fontWeight: "900" },
  meta: { opacity: 0.6, marginTop: 4, fontSize: 12 },
});