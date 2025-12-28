import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import Button from "../../components/Button";
import HtmlContent from "../../components/HtmlContent";
import { materialService } from "../../services/material.service";
import type { MaterialDetail } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MaterialStackParamList } from "../../navigation/MaterialStack";

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

  if (!data) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{data.title}</Text>
      {!!data.description && <Text style={styles.desc}>{data.description}</Text>}

      <View style={{ height: 10 }} />
      <Button
        title={busy ? "..." : data.isLikedByUser ? "Unlike" : "Like"}
        onPress={toggleLike}
        disabled={busy}
      />

      <View style={{ height: 16 }} />
      <HtmlContent html={data.contentHtml} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", marginBottom: 6 },
  desc: { opacity: 0.8, marginBottom: 12 },
});