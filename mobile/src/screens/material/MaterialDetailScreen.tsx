import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable } from "react-native";
import Button from "../../components/Button";
import HtmlContent from "../../components/HtmlContent";
import { materialService } from "../../services/material.service";
import type { MaterialDetail } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MaterialStackParamList } from "../../navigation/MaterialStack";
import theme from "../../styles/theme";

type Props = NativeStackScreenProps<MaterialStackParamList, "MaterialDetail">;

export default function MaterialDetailScreen({ route }: Props) {
  const { slug } = route.params;
  const [data, setData] = useState<MaterialDetail | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await materialService.detail(slug);
    setData(res);
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function toggleLike() {
    if (!data) return;
    setBusy(true);
    try {
      const res = await materialService.toggleLike(slug);
      setData({ ...data, isLikedByUser: res.liked });
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <View style={{ padding: theme.spacing.lg }}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Image source={require("../../../assets/img/books.png")} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{data.title}</Text>
            {!!data.description && <Text style={styles.desc}>{data.description}</Text>}
          </View>
        </View>

        <View style={{ height: theme.spacing.md }} />
        <Pressable
          onPress={toggleLike}
          disabled={busy}
          style={[styles.likeBtn, data.isLikedByUser && styles.likeBtnActive, busy && { opacity: 0.6 }]}
        >
          <Text style={[styles.likeBtnText, data.isLikedByUser && styles.likeBtnTextActive]}>
            {data.isLikedByUser ? "♥ Liked" : "♡ Like"}
          </Text>
        </Pressable>
      </View>

      <View style={{ height: theme.spacing.lg }} />
      <View style={styles.contentCard}>
        <HtmlContent html={data.contentHtml} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: theme.spacing.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  icon: { width: 44, height: 44, marginRight: theme.spacing.md },
  title: { fontSize: 22, fontWeight: "900", color: theme.colors.text },
  desc: { marginTop: 6, color: theme.colors.muted },

  likeBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  likeBtnActive: { borderColor: "#ef4444", backgroundColor: "#fff5f5" },
  likeBtnText: { fontWeight: "900", color: theme.colors.text },
  likeBtnTextActive: { color: "#ef4444" },

  contentCard: {
    padding: theme.spacing.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
});