import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
    <Stack.Navigator>
      <Stack.Screen name="ExamList" component={ExamListScreen} options={{ title: "Exams" }} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ title: "Take Exam" }} />
      <Stack.Screen name="ExamSubmitResult" component={ExamSubmitResultScreen} options={{ title: "Result" }} />
      <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} options={{ title: "Submissions" }} />
    </Stack.Navigator>
  );
}