import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/Button";
import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamSubmitResult">;

export default function ExamSubmitResultScreen({ route, navigation }: Props) {
  const { slug, score, totalQuestions, percentage } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />
      <View style={[styles.wrap, { paddingTop: insets.top + theme.spacing.xl, paddingBottom: insets.bottom + theme.spacing.xl }]}>
        <Text style={styles.title}>Exam Submitted</Text>
        <Text style={styles.line}>Score: {score}/{totalQuestions}</Text>
        <Text style={styles.line}>Percentage: {percentage}%</Text>

        <View style={{ height: 18 }} />
        <Button title="View submissions" onPress={() => navigation.navigate("ExamHistory", { slug })} />
        <View style={{ height: 12 }} />
        <Button title="Back to exam list" onPress={() => navigation.navigate("ExamList")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, padding: theme.spacing.lg, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 10, color: "rgba(88, 28, 135, 0.94)", textAlign: "center" },
  line: { fontSize: 16, marginBottom: 6, color: "rgba(17,17,17,0.78)", textAlign: "center", fontWeight: "700" },
});