import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
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

const ICONS: Record<keyof AppTabsParamList, any> = {
  Materials: require("../../assets/img/material.png"),
  Missions: require("../../assets/img/mission.png"),
  Exams: require("../../assets/img/exam.png"),
  Profile: require("../../assets/img/profile.png"),
};

function TabItem({
  label,
  icon,
  active,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: any;
  active: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabItem} hitSlop={8}>
      <View style={styles.tabItemInner}>
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <Image source={icon} style={[styles.icon, active && styles.iconActive]} />
        </View>
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
        {active ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
      </View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <LinearGradient
      colors={["rgba(167,139,250,0.30)", "rgba(196,181,253,0.26)", "rgba(245,243,255,1)"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.barWrapGradient}
    >
      <View style={[styles.barBackground, { backgroundColor: "transparent" }]}>
        <View style={styles.bar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? String(options.tabBarLabel)
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as any);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            const icon = ICONS[route.name as keyof AppTabsParamList];

            return <TabItem key={route.key} label={label} icon={icon} active={isFocused} onPress={onPress} onLongPress={onLongPress} />;
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Materials" component={MaterialStack} />
      <Tab.Screen name="Missions" component={MissionStack} />
      <Tab.Screen name="Exams" component={ExamStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barWrapGradient: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 14,
    paddingTop: 8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "visible",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "transparent",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  iconWrapActive: {
    backgroundColor: "#F6F0FF",
    borderColor: "rgba(111,75,216,0.18)",
    borderWidth: 1,
    shadowColor: "rgba(111,75,216,0.12)",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  iconActive: {},
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#6F4BD8",
    textAlign: "center",
    flexWrap: "nowrap",
    includeFontPadding: false,
  },
  labelActive: {
    color: "#6F4BD8",
    fontSize: 13,
  },
  indicator: {
    width: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(111,75,216,0.12)",
    marginTop: 8,
  },
  indicatorSpacer: { width: 22, height: 6, marginTop: 8, opacity: 0 },
  barBackground: {
    position: "relative",
    borderRadius: 20,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "transparent",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});
