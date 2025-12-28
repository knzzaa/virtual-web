import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/auth.context";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      const res = await authService.register({ name, email, password });
      await login(res.token);
    } catch (e: any) {
      Alert.alert("Register failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create account</Text>

      <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextField label="Email" value={email} onChangeText={setEmail} />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title={busy ? "Creating..." : "Register"} onPress={onSubmit} disabled={busy} />

      <Pressable onPress={() => navigation.navigate("Login")} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>
          Already have an account? <Text style={{ fontWeight: "800" }}>Login</Text>
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 16 },
});