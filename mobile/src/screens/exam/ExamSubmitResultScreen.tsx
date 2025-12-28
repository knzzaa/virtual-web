import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExamStackParamList } from "../../navigation/ExamStack";

type Props = NativeStackScreenProps<ExamStackParamList, "ExamSubmitResult">;

export default function ExamSubmitResultScreen({ route, navigation }: Props) {
  const { slug, score, totalQuestions, percentage } = route.params;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Exam Submitted</Text>
      <Text style={styles.line}>Score: {score}/{totalQuestions}</Text>
      <Text style={styles.line}>Percentage: {percentage}%</Text>

      <View style={{ height: 16 }} />
      <Button title="View submissions" onPress={() => navigation.navigate("ExamHistory", { slug })} />
      <View style={{ height: 10 }} />
      <Button title="Back to exam list" onPress={() => navigation.navigate("ExamList")} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 10 },
  line: { fontSize: 16, marginBottom: 6 },
});