import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionResult">;

export default function MissionResultScreen({ route, navigation }: Props) {
  const { percentage, finalScore, totalQuestions } = route.params;

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />

      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <View
          style={[
            styles.card,
            {
              marginTop: insets.top + 54,
              marginBottom: tabBarHeight + insets.bottom + theme.spacing.xl,
            },
          ]}
        >
          <Text style={styles.title}>Mission Completed</Text>

          <View style={{ height: 10 }} />
          <Text style={styles.line}>
            Score: {finalScore}/{totalQuestions}
          </Text>
          <Text style={styles.line}>Percentage: {percentage}%</Text>

          <View style={{ height: theme.spacing.lg }} />

          <Pressable onPress={() => navigation.navigate("MissionHome")} style={styles.submissionsPill}>
            <Text style={styles.submissionsText}>Back to Missions</Text>
          </Pressable>

          <View style={{ height: theme.spacing.sm }} />

          <Pressable onPress={() => navigation.navigate("MissionHistory")} style={styles.submissionsPill}>
            <Text style={styles.submissionsText}>View history</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  title: {
    fontWeight: "800",
    fontSize: 18,
    color: "rgba(88, 28, 135, 0.94)",
    lineHeight: 24,
  },
  line: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(88, 28, 135, 0.72)",
    opacity: 0.95,
    marginBottom: 6,
  },

  // sama persis konsep "View submissions" di ExamListScreen
  submissionsPill: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(167, 139, 250, 0.10)",
    borderColor: "rgba(167, 139, 250, 0.22)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  submissionsText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(88, 28, 135, 0.80)",
  },
});