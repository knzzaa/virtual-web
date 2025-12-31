import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { missionService } from "../../services/mission.service";
import type { MissionCompletionHistoryItem } from "../../types/dtos";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

export default function MissionHistoryScreen() {
  const [items, setItems] = useState<MissionCompletionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

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
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />

      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{
            paddingTop: insets.top + 54, // room for transparent header (samain Material/Exam)
            paddingBottom: tabBarHeight + insets.bottom + theme.spacing.xl,
          }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.missionTitle}</Text>
              <Text style={styles.meta}>
                Score {item.score}/{item.totalQuestions} • {new Date(item.completedAt).toLocaleString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>No history.</Text>
            ) : (
              <Text style={styles.empty}>Loading...</Text>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    marginBottom: theme.spacing.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  title: {
    fontWeight: "800",
    fontSize: 16,
    color: "rgba(88, 28, 135, 0.94)",
    lineHeight: 22,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(88, 28, 135, 0.72)",
    opacity: 0.95,
  },
  empty: {
    color: "rgba(88, 28, 135, 0.82)",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "700",
  },
});