import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import ExamListScreen from "../screens/exam/ExamListScreen";
import ExamDetailScreen from "../screens/exam/ExamDetailScreen";
import ExamSubmitResultScreen from "../screens/exam/ExamSubmitResultScreen";
import ExamHistoryScreen from "../screens/exam/ExamHistoryScreen";

export type ExamStackParamList = {
  ExamList: undefined;
  ExamDetail: { slug: string };
  ExamSubmitResult: { slug: string; submissionId: number; score: number; totalQuestions: number; percentage: number };
  ExamHistory: { slug: string };
};

const Stack = createNativeStackNavigator<ExamStackParamList>();

export default function ExamStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerTitleStyle: {
          fontWeight: "900",
          fontSize: 20,
          color: "rgba(88, 28, 135, 0.96)",
        },
        headerTitleAlign: "center",
        headerTintColor: "rgba(88, 28, 135, 0.85)",
        headerStyle: { backgroundColor: "transparent" },
        headerShadowVisible: false,
        headerBackground: () => (
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(196, 181, 253, 0.55)", "rgba(196, 181, 253, 0.00)"]}
            start={{ x: 0.5, y: 0.0 }}
            end={{ x: 0.5, y: 1.0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}
    >
      <Stack.Screen name="ExamList" component={ExamListScreen} options={{ title: "Exams" }} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ title: "Take Exam" }} />
      <Stack.Screen name="ExamSubmitResult" component={ExamSubmitResultScreen} options={{ title: "Result" }} />
      <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} options={{ title: "Submissions" }} />
    </Stack.Navigator>
  );
}