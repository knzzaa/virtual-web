import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import MaterialStack from "./MaterialStack";
import MissionStack from "./MissionStack";
import ExamStack from "./ExamStack";
import ProfileScreen from "../screens/common/ProfileScreen";
import theme from "../styles/theme";

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
  const hover = useSharedValue(0);
  const pressed = useSharedValue(0);
  const activeSV = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    activeSV.value = withTiming(active ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, activeSV]);

  React.useEffect(() => {
    // ensure hover resets when leaving web tab focus
    if (!active) {
      // keep as-is
    }
  }, [active]);

  const aStyle = useAnimatedStyle(() => {
    const h = hover.value;
    const p = pressed.value;
    const a = activeSV.value;
    const lift = interpolate(h, [0, 1], [0, -7]);
    // Keep scaling subtle to avoid blurring PNG icons.
    // The "selected" look should come from highlight + glow, like the reference.
    const hoverScale = 1 + interpolate(h, [0, 1], [0, 0.05]);
    const activeScale = 1 + interpolate(a, [0, 1], [0, 0.10]);
    const pressScale = 1 - interpolate(p, [0, 1], [0, 0.04]);
    const scale = hoverScale * activeScale * pressScale;
    return {
      transform: [{ translateY: lift }, { scale }],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const h = hover.value;
    const opacity = interpolate(h, [0, 1], [0.78, 1]);
    // Never scale raster PNG icons (causes blur). Emphasis is handled by glow/container.
    return { opacity };
  });

  const glowStyle = useAnimatedStyle(() => {
    // kept for backward compatibility; no-op after simplification
    return { opacity: 0 };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={Platform.OS === "web" ? () => (hover.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) })) : undefined}
      onHoverOut={Platform.OS === "web" ? () => (hover.value = withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) })) : undefined}
      onPressIn={() => (pressed.value = withTiming(1, { duration: 80 }))}
      onPressOut={() => (pressed.value = withTiming(0, { duration: 120 }))}
      style={styles.tabItem}
      hitSlop={10}
    >
      <Animated.View style={[styles.tabItemInner, aStyle]}>
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <Animated.View style={iconStyle}>
            <Image source={icon} style={[styles.icon, active && styles.iconActive]} />
          </Animated.View>
        </View>
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
        {active ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.barWrap}>
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
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as any);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          const icon = ICONS[route.name as keyof AppTabsParamList];

          return (
            <TabItem
              key={route.key}
              label={label}
              icon={icon}
              active={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
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
  barWrap: {
    // No extra background layer — let the screen background show through.
    backgroundColor: "transparent",
    // Edge-to-edge so the panel follows iPhone rounded corners (no square block)
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 14,
    paddingTop: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  borderRadius: 38,
  paddingVertical: 14,
  paddingHorizontal: 16,
    // Clean glass panel (no purple block)
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    shadowColor: "rgba(0,0,0,0.55)",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    minWidth: 64,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  iconWrapActive: {
    backgroundColor: "rgba(196, 181, 253, 0.55)",
    borderColor: "rgba(167, 139, 250, 0.35)",
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    // Keep PNG colors clear. If your icons are monochrome, we can re-enable tint.
    tintColor: undefined,
  },
  iconActive: {
    tintColor: undefined,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(88, 28, 135, 0.80)",
  },
  labelActive: {
    color: "rgba(88, 28, 135, 0.95)",
  },
  indicator: {
    width: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(88, 28, 135, 0.30)",
    marginTop: 8,
  },
  indicatorSpacer: { width: 22, height: 6, marginTop: 8, opacity: 0 },
});