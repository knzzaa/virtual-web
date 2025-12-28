import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Image } from "react-native";
import theme from "../../styles/theme";
import { examService } from "../../services/exam.service";
import type { ExamListItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamList">;

export default function ExamListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await examService.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.slug}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("ExamDetail", { slug: item.slug })}>
            <View style={styles.row}>
              <Image source={require("../../../assets/img/clock.png")} style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
              </View>
            </View>
            <Pressable onPress={() => navigation.navigate("ExamHistory", { slug: item.slug })}>
              <Text style={styles.link}>View submissions</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text>No exams.</Text> : <Text>Loading...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.card.padding, borderWidth: theme.card.borderWidth, borderColor: theme.card.borderColor, borderRadius: theme.card.borderRadius, marginBottom: theme.spacing.sm, backgroundColor: theme.colors.card },
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4, color: theme.colors.text },
  desc: { opacity: 0.75, marginBottom: 8, color: theme.colors.muted },
  link: { fontWeight: "800", color: theme.colors.accent },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 36, height: 36, marginRight: 12 },
});