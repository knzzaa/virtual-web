import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Image } from "react-native";
import theme from "../../styles/theme";
import { materialService } from "../../services/material.service";
import type { MaterialListItem } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MaterialStackParamList } from "../../navigation/MaterialStack";

type Props = NativeStackScreenProps<MaterialStackParamList, "MaterialList">;

export default function MaterialListScreen({ navigation }: Props) {
  const [items, setItems] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    <View style={{ flex: 1, padding: theme.spacing.lg }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.slug}
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
            <Text style={styles.meta}>{item.isLikedByUser ? "♥ Liked" : "♡ Not liked"}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text>No materials.</Text> : <Text>Loading...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.card.padding, borderWidth: theme.card.borderWidth, borderColor: theme.card.borderColor, borderRadius: theme.card.borderRadius, marginBottom: theme.spacing.sm, backgroundColor: theme.colors.card },
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4, color: theme.colors.text },
  desc: { opacity: 0.75, marginBottom: 8, color: theme.colors.muted },
  meta: { opacity: 0.6, fontSize: 12, color: theme.colors.muted },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 36, height: 36, marginRight: 12 },
});