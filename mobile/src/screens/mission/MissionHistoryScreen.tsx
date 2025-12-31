import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { missionService } from "../../services/mission.service";
import type { MissionCompletionHistoryItem } from "../../types/dtos";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function MissionHistoryScreen() {
  const [items, setItems] = useState<MissionCompletionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const headerHeight = useHeaderHeight();
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
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: tabBarHeight + insets.bottom + theme.spacing.lg,
        }}
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.missionTitle}</Text>
            <Text style={styles.meta}>
              Score {item.score}/{item.totalQuestions} •{" "}
              {new Date(item.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No history.</Text> : <Text style={styles.empty}>Loading...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  empty: { color: theme.colors.muted, fontWeight: "800", paddingTop: theme.spacing.lg },
});