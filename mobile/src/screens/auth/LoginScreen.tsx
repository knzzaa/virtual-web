import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/auth.context";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      const res = await authService.login({ email, password });
      await login(res.token);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Welcome back</Text>

      <TextField label="Email" value={email} onChangeText={setEmail} />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title={busy ? "Logging in..." : "Login"} onPress={onSubmit} disabled={busy} />

      <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>
          Don&apos;t have an account? <Text style={{ fontWeight: "800" }}>Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 16 },
});