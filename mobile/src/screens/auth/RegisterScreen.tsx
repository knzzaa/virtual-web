import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable, Image } from "react-native";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/auth.context";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import theme from "../../styles/theme";

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
      <View style={styles.card}>
        <Image source={require("../../../assets/img/books.png")} style={styles.logo} />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start your English journey today.</Text>

        <View style={{ height: 12 }} />
        <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        <Button title={busy ? "Creating..." : "Register"} onPress={onSubmit} disabled={busy} />

        <Pressable onPress={() => navigation.navigate("Login")} style={{ marginTop: theme.spacing.md }}>
          <Text style={styles.bottomText}>
            Already have an account? <Text style={styles.bottomLink}>Login</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: theme.spacing.lg, justifyContent: "center", backgroundColor: theme.colors.background },
  card: {
    padding: theme.spacing.xl,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  logo: { width: 72, height: 72, alignSelf: "center", marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "900", color: theme.colors.text, textAlign: "center" },
  subtitle: { marginTop: 6, color: theme.colors.muted, textAlign: "center" },
  bottomText: { textAlign: "center", color: theme.colors.text },
  bottomLink: { fontWeight: "900", color: theme.colors.accent },
});