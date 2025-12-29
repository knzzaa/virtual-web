import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/auth.context";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import theme from "../../styles/theme";
import AnimatedAuthBackground from "../../components/AnimatedAuthBackground";
import YellowSparkles from "../../components/YellowSparkles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedHeroGlow from "../../components/AnimatedHeroGlow";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();

  async function onSubmit() {
    if (!name.trim()) return Alert.alert("Register failed", "Full name is required");
    if (!email.trim()) return Alert.alert("Register failed", "Email is required");
    if (password.length < 6) return Alert.alert("Register failed", "Password must be at least 6 characters");
    if (password !== confirmPassword) return Alert.alert("Register failed", "Passwords do not match");

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
    <View style={styles.screen}>
      <AnimatedAuthBackground>
        <YellowSparkles />
      </AnimatedAuthBackground>

      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 54 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.formBlock}>
              <Text style={styles.brand}>ENGLISHLAB</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to start learning English</Text>

              <View style={{ height: 14 }} />
              <TextField
                label="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholder="Enter your full name"
              />
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Create a password"
              />
              <Text style={styles.helper}>Must be at least 6 characters</Text>

              <TextField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm your password"
              />

              <Button title={busy ? "CREATING..." : "SIGN UP"} onPress={onSubmit} disabled={busy} />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={() => navigation.navigate("Login")} style={{ marginTop: theme.spacing.lg }}>
                <Text style={styles.bottomText}>
                  Already have an account? <Text style={styles.bottomLink}>Login</Text>
                </Text>
              </Pressable>
            </View>

            <View style={styles.panel}>
              <AnimatedHeroGlow source={require("../../../assets/img/register.png")} variant="purple" width={240} height={200} />
              <Text style={styles.panelTitle}>Join Our Community</Text>
              <Text style={styles.panelSub}>
                Access interactive lessons, track your{"\n"}progress, and achieve fluency
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4efff" },
  wrap: { flex: 1, padding: theme.spacing.lg },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.16)",
  },
  formBlock: { padding: theme.spacing.xl },
  brand: { color: "#a78bfa", fontWeight: "900", letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: "900", color: "#2a0a57" },
  subtitle: { marginTop: 6, color: "#6b7280", lineHeight: 20 },
  helper: { marginTop: -6, marginBottom: 10, color: "#6b7280", fontSize: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(17, 24, 39, 0.12)" },
  dividerText: { paddingHorizontal: 10, color: "#6b7280", fontWeight: "700" },

  panel: {
    padding: theme.spacing.xl,
    backgroundColor: "rgba(167, 139, 250, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: { fontSize: 22, fontWeight: "900", color: "#2a0a57", textAlign: "center" },
  panelSub: { marginTop: 8, color: "rgba(17, 24, 39, 0.65)", textAlign: "center", lineHeight: 20 },
  bottomText: { textAlign: "center", color: "#111827" },
  bottomLink: { fontWeight: "900", color: "#7c3aed" },
});