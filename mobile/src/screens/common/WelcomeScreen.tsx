import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>EnglishLab</Text>
      <Text style={styles.subtitle}>Learn English with materials, exams and missions.</Text>

      <View style={{ height: 24 }} />

      <Pressable style={styles.primary} onPress={() => navigation.navigate("Register") }>
        <Text style={styles.primaryText}>Get Started</Text>
      </Pressable>

      <View style={{ height: 12 }} />

      <Pressable style={styles.secondary} onPress={() => navigation.navigate("Login") }>
        <Text style={styles.secondaryText}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: theme.spacing.xl, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 36, fontWeight: "900", color: theme.colors.text },
  subtitle: { marginTop: 8, opacity: 0.8, textAlign: "center", maxWidth: 320, color: theme.colors.muted },
  primary: { backgroundColor: theme.colors.accent, paddingVertical: 12, paddingHorizontal: 28, borderRadius: theme.radius.sm },
  primaryText: { color: "white", fontWeight: "700" },
  secondary: { borderWidth: 1, borderColor: theme.card.borderColor, paddingVertical: 12, paddingHorizontal: 28, borderRadius: theme.radius.sm },
  secondaryText: { color: theme.colors.text, fontWeight: "700" },
});
