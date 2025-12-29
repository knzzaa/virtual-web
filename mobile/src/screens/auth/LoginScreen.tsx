import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Image,
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.formBlock}>
              <Text style={styles.brand}>ENGLISHLAB</Text>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Login to continue your learning journey</Text>

              <View style={{ height: 14 }} />
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
              />

              <Button
                title={busy ? "LOGGING IN..." : "LOGIN"}
                onPress={onSubmit}
                disabled={busy}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: theme.spacing.lg }}>
                <Text style={styles.bottomText}>
                  Don&apos;t have an account? <Text style={styles.bottomLink}>Sign up</Text>
                </Text>
              </Pressable>
            </View>

            <View style={styles.panel}>
              <Image source={require("../../../assets/img/login.png")} style={styles.panelHero} />
              <Text style={styles.panelTitle}>Start Your English Journey</Text>
              <Text style={styles.panelSub}>
                Learn, practice, and master English with our{"\n"}interactive lessons
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
  title: { fontSize: 30, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, color: "#6b7280", lineHeight: 20 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(17, 24, 39, 0.12)" },
  dividerText: { paddingHorizontal: 10, color: "#6b7280", fontWeight: "700" },

  panel: {
    padding: theme.spacing.xl,
    backgroundColor: "rgba(167, 139, 250, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  panelHero: { width: 240, height: 200, resizeMode: "contain", marginBottom: 14 },
  panelTitle: { fontSize: 22, fontWeight: "900", color: "#2a0a57", textAlign: "center" },
  panelSub: { marginTop: 8, color: "rgba(17, 24, 39, 0.65)", textAlign: "center", lineHeight: 20 },
  bottomText: { textAlign: "center", color: "#111827" },
  bottomLink: { fontWeight: "900", color: "#7c3aed" },
});