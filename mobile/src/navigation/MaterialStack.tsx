import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import MaterialListScreen from "../screens/material/MaterialListScreen";
import MaterialDetailScreen from "../screens/material/MaterialDetailScreen";

export type MaterialStackParamList = {
  MaterialList: undefined;
  MaterialDetail: { slug: string };
};

const Stack = createNativeStackNavigator<MaterialStackParamList>();

export default function MaterialStack() {
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
        // soft glow-ish shadow for iOS, subtle for Android
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
      <Stack.Screen
        name="MaterialList"
        component={MaterialListScreen}
        options={{
          title: "Materials",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} options={{ title: "Detail" }} />
    </Stack.Navigator>
  );
}