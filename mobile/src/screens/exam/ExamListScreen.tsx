import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from "react-native";
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
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.slug}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("ExamDetail", { slug: item.slug })}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
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
  card: { padding: 14, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 10 },
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4 },
  desc: { opacity: 0.75, marginBottom: 8 },
  link: { fontWeight: "800" },
});