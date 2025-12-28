import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import { useAuth } from "../context/auth.context";
import SplashScreen from "../screens/common/SplashScreen";

export default function RootNavigator() {
  const { loading, isAuthed } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {isAuthed ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}