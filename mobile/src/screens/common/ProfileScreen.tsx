import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/auth.context";
import theme from "../../styles/theme";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

export default function ProfileScreen() {
  const { me, logout } = useAuth();

  if (!me) {
    return (
      <View style={styles.screen}>
        <AnimatedAppBackground />
        <View style={styles.wrap}>
          <Text style={{ color: theme.colors.text }}>Not logged in</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Image source={require("../../../assets/img/about-us.png")} style={styles.avatar} />
          <Text style={styles.title}>Profile</Text>

          <View style={{ height: theme.spacing.md }} />
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{me.name}</Text>

          <View style={{ height: theme.spacing.md }} />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{me.email}</Text>

          <View style={{ height: theme.spacing.lg }} />
          <Button title="Logout" onPress={logout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, padding: theme.spacing.lg },
  card: {
    padding: theme.spacing.xl,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  avatar: { width: 64, height: 64, alignSelf: "center", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: theme.colors.text, textAlign: "center" },
  label: { fontSize: 12, fontWeight: "800", color: theme.colors.muted },
  value: { fontSize: 16, fontWeight: "700", color: theme.colors.text, marginTop: 4 },
});