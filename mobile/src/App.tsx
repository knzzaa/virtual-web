import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/auth.context";
import RootNavigator from "./navigation/RootNavigator";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Text } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    // keep it simple: avoid layout jumps
    return (
      <SafeAreaProvider>
        <Text />
      </SafeAreaProvider>
    );
  }

  // Set default font across the whole app.
  // (This keeps changes minimal; no need to edit every screen.)
  if (!(Text as any).defaultProps) (Text as any).defaultProps = {};
  (Text as any).defaultProps.style = [
    {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    (Text as any).defaultProps.style,
  ];

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}