import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MissionNextScreen from "../screens/mission/MissionNextScreen";
import MissionResultScreen from "../screens/mission/MissionResultScreen";
import MissionHistoryScreen from "../screens/mission/MissionHistoryScreen";

export type MissionStackParamList = {
  MissionNext: undefined;
  MissionResult: { percentage: number; finalScore: number; totalQuestions: number };
  MissionHistory: undefined;
};

const Stack = createNativeStackNavigator<MissionStackParamList>();

export default function MissionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MissionNext" component={MissionNextScreen} options={{ title: "Mission" }} />
      <Stack.Screen name="MissionResult" component={MissionResultScreen} options={{ title: "Result" }} />
      <Stack.Screen name="MissionHistory" component={MissionHistoryScreen} options={{ title: "History" }} />
    </Stack.Navigator>
  );
}