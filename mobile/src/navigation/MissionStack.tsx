import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

import MissionHomeScreen from "../screens/mission/MissionHomeScreen";
import MissionNextScreen from "../screens/mission/MissionNextScreen";
import MissionResultScreen from "../screens/mission/MissionResultScreen";
import MissionHistoryScreen from "../screens/mission/MissionHistoryScreen";
import type { MissionNextResponse } from "../types/dtos";

export type MissionStackParamList = {
  MissionHome: undefined;
  MissionNext: { initialData?: MissionNextResponse } | undefined;
  MissionResult: { percentage: number; finalScore: number; totalQuestions: number };
  MissionHistory: undefined;
};

const Stack = createNativeStackNavigator<MissionStackParamList>();

export default function MissionStack() {
  return (
    <Stack.Navigator
      initialRouteName="MissionHome"
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,

        // ✅ samain kayak MaterialStack
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "900",
          fontSize: 20,
          color: "rgba(88, 28, 135, 0.96)",
        },
        headerTintColor: "rgba(88, 28, 135, 0.85)",
        headerStyle: { backgroundColor: "transparent" },

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
      <Stack.Screen
        name="MissionHome"
        component={MissionHomeScreen}
        options={{ title: "Mission", headerBackVisible: false }}
      />
      <Stack.Screen name="MissionNext" component={MissionNextScreen} options={{ title: "Mission" }} />
      <Stack.Screen name="MissionHistory" component={MissionHistoryScreen} options={{ title: "History" }} />
      <Stack.Screen name="MissionResult" component={MissionResultScreen} options={{ title: "Result" }} />
    </Stack.Navigator>
  );
}