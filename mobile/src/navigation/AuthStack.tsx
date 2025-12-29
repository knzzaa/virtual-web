import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import WelcomeScreen from "../screens/common/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
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
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
    </Stack.Navigator>
  );
}