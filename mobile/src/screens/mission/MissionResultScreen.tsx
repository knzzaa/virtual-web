import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionResult">;

export default function MissionResultScreen({ route, navigation }: Props) {
  const { percentage, finalScore, totalQuestions } = route.params;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Mission Completed</Text>
      <Text style={styles.line}>Score: {finalScore}/{totalQuestions}</Text>
      <Text style={styles.line}>Percentage: {percentage}%</Text>

      <View style={{ height: 16 }} />
      <Button title="Back to Mission" onPress={() => navigation.navigate("MissionNext")} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: theme.spacing.lg, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 10, color: theme.colors.text },
  line: { fontSize: 16, marginBottom: 6, color: theme.colors.text },
});