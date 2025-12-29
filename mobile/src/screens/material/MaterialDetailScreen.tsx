import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HtmlContent from "../../components/HtmlContent";
import { materialService } from "../../services/material.service";
import type { MaterialDetail } from "../../types/dtos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MaterialStackParamList } from "../../navigation/MaterialStack";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import PurpleLights from "../../components/PurpleLights";

type Props = NativeStackScreenProps<MaterialStackParamList, "MaterialDetail">;

export default function MaterialDetailScreen({ route }: Props) {
  const { slug } = route.params;
  const [data, setData] = useState<MaterialDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();

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

  if (!data)
    return (
      <View style={{ flex: 1 }}>
        <AnimatedAppBackground />
        <View style={{ padding: theme.spacing.lg, paddingTop: insets.top + theme.spacing.lg }}>
          <Text style={{ color: "rgba(88, 28, 135, 0.82)" }}>Loading...</Text>
        </View>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />
      <PurpleLights count={12} />

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingTop: insets.top + 64, // push content below the transparent header/notch
          paddingBottom: theme.spacing.xl,
        }}
      >
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
          style={[styles.likePill, data.isLikedByUser ? styles.likePillActive : styles.likePillIdle, busy && { opacity: 0.6 }]}
        >
          <Text style={[styles.likePillText, data.isLikedByUser ? styles.likePillTextActive : styles.likePillTextIdle]}>
            {data.isLikedByUser ? "♥ Liked" : "♡ Like"}
          </Text>
        </Pressable>
      </View>

      <View style={{ height: theme.spacing.lg }} />

      <View style={styles.contentCard}>
        <HtmlContent html={data.contentHtml} />
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  icon: { width: 44, height: 44, marginRight: theme.spacing.md },
  title: { fontSize: 18, fontWeight: "800", color: "rgba(88, 28, 135, 0.94)", lineHeight: 24 },
  desc: { marginTop: 6, color: "rgba(88, 28, 135, 0.72)", lineHeight: 19, fontSize: 13 },

  likePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  likePillIdle: { backgroundColor: "rgba(167, 139, 250, 0.10)", borderColor: "rgba(167, 139, 250, 0.22)" },
  likePillActive: { backgroundColor: "rgba(167, 139, 250, 0.16)", borderColor: "rgba(167, 139, 250, 0.30)" },
  likePillText: { fontSize: 12, fontWeight: "700" },
  likePillTextIdle: { color: "rgba(88, 28, 135, 0.76)" },
  likePillTextActive: { color: "rgba(88, 28, 135, 0.92)" },

  contentCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
});