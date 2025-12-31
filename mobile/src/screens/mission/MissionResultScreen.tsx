import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionResult">;

export default function MissionResultScreen({ route, navigation }: Props) {
  const { percentage, finalScore, totalQuestions } = route.params;

  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.screen}>
      <AnimatedAppBackground />

      <View
        style={[
          styles.wrap,
          {
            paddingTop: headerHeight + theme.spacing.md,
            paddingBottom: tabBarHeight + insets.bottom + theme.spacing.lg,
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Mission Completed</Text>

          <View style={{ height: 10 }} />
          <Text style={styles.line}>Score: {finalScore}/{totalQuestions}</Text>
          <Text style={styles.line}>Percentage: {percentage}%</Text>

          <View style={{ height: theme.spacing.lg }} />

          <Button title="Back to Mission Home" onPress={() => navigation.navigate("MissionHome")} />

          <View style={{ height: theme.spacing.sm }} />

          <Button title="View History" onPress={() => navigation.navigate("MissionHistory")} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: theme.spacing.lg },
  card: {
    padding: theme.spacing.lg,
    borderWidth: theme.card.borderWidth,
    borderColor: theme.card.borderColor,
    borderRadius: theme.card.borderRadius,
    backgroundColor: theme.colors.card,
  },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 10, color: theme.colors.text },
  line: { fontSize: 14, marginBottom: 6, color: theme.colors.muted, fontWeight: "800" },
});