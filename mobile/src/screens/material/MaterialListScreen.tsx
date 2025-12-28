import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from "react-native";
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
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.slug}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("MaterialDetail", { slug: item.slug })}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
            <Text style={styles.meta}>{item.isLikedByUser ? "♥ Liked" : "♡ Not liked"}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text>No materials.</Text> : <Text>Loading...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 10 },
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4 },
  desc: { opacity: 0.75, marginBottom: 8 },
  meta: { opacity: 0.6, fontSize: 12 },
});