import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../styles/theme";
import { materialService } from "../../services/material.service";
import type { MaterialListItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MaterialStackParamList } from "../../navigation/MaterialStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MaterialStackParamList, "MaterialList">;

export default function MaterialListScreen({ navigation }: Props) {
  const [items, setItems] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  async function load() {
    setLoading(true);
    try {
      const res = await materialService.list();
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
        keyExtractor={(it) => it.slug}
        contentContainerStyle={{
          paddingTop: insets.top + 54, // room for transparent header
          paddingBottom: theme.spacing.xl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("MaterialDetail", { slug: item.slug })}>
            <View style={styles.row}>
              <Image source={require("../../../assets/img/books.png")} style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
              </View>
            </View>

            <View style={styles.actionsRow}>
              <View style={[styles.pill, item.isLikedByUser ? styles.pillActive : styles.pillIdle]}>
                <Ionicons
                  name={item.isLikedByUser ? "heart" : "heart-outline"}
                  size={14}
                  color={item.isLikedByUser ? "rgba(88, 28, 135, 0.92)" : "rgba(88, 28, 135, 0.70)"}
                  style={styles.pillIcon}
                />
                <Text style={[styles.pillText, item.isLikedByUser ? styles.pillTextActive : styles.pillTextIdle]}>
                  {item.isLikedByUser ? "Liked" : "Not liked"}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No materials.</Text> : <Text style={styles.empty}>Loading...</Text>}
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
  desc: { opacity: 0.95, marginBottom: 12, color: "rgba(88, 28, 135, 0.72)", lineHeight: 19, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 40, height: 40, marginRight: 12 },
  actionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  pillIdle: { backgroundColor: "rgba(167, 139, 250, 0.10)", borderColor: "rgba(167, 139, 250, 0.22)" },
  pillActive: { backgroundColor: "rgba(167, 139, 250, 0.16)", borderColor: "rgba(167, 139, 250, 0.30)" },
  pillText: { fontSize: 12, fontWeight: "700" },
  pillIcon: { marginRight: 8 },
  pillTextIdle: { color: "rgba(88, 28, 135, 0.76)" },
  pillTextActive: { color: "rgba(88, 28, 135, 0.92)" },
  empty: { color: "rgba(88, 28, 135, 0.82)", textAlign: "center", marginTop: 18, fontWeight: "700" },
});