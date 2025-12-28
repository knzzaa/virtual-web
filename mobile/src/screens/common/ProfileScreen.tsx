import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/auth.context";

export default function ProfileScreen() {
  const { me, logout } = useAuth();

  if (!me) {
    return (
      <View style={styles.wrap}>
        <Text>Not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.line}>Name: {me.name}</Text>
      <Text style={styles.line}>Email: {me.email}</Text>

      <View style={{ height: 16 }} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  line: { marginBottom: 6 },
});