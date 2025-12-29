import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../styles/theme";
import { examService } from "../../services/exam.service";
import type { ExamListItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamList">;

export default function ExamListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

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
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />

      <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.slug}
        contentContainerStyle={{
          paddingTop: insets.top + 54, // room for transparent header
          paddingBottom: theme.spacing.xl,
        }}
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
            <Pressable
              onPress={() => navigation.navigate("ExamHistory", { slug: item.slug })}
              style={styles.submissionsPill}
            >
              <Text style={styles.submissionsText}>View submissions</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No exams.</Text> : <Text style={styles.empty}>Loading...</Text>}
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
  title: { fontWeight: "800", fontSize: 18, marginBottom: 6, color: "rgba(88, 28, 135, 0.94)", lineHeight: 24 },
  desc: { opacity: 0.95, marginBottom: 4, color: "rgba(88, 28, 135, 0.72)", lineHeight: 19, fontSize: 13 },
  submissionsPill: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(167, 139, 250, 0.10)",
    borderColor: "rgba(167, 139, 250, 0.22)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  submissionsText: { fontSize: 12, fontWeight: "800", color: "rgba(88, 28, 135, 0.80)" },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 40, height: 40, marginRight: 12 },
  empty: { color: "rgba(88, 28, 135, 0.82)", textAlign: "center", marginTop: 18, fontWeight: "700" },
});