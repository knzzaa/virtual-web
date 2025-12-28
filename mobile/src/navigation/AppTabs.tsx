import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialStack from "./MaterialStack";
import MissionStack from "./MissionStack";
import ExamStack from "./ExamStack";
import ProfileScreen from "../screens/common/ProfileScreen";

export type AppTabsParamList = {
  Materials: undefined;
  Missions: undefined;
  Exams: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Materials" component={MaterialStack} />
      <Tab.Screen name="Missions" component={MissionStack} />
      <Tab.Screen name="Exams" component={ExamStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}