import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import theme from "../../styles/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MissionStackParamList } from "../../navigation/MissionStack";
import AnimatedAppBackground from "../../components/AnimatedAppBackground";
import { missionService } from "../../services/mission.service";

type Props = NativeStackScreenProps<MissionStackParamList, "MissionResult">;

const TITLE = "rgba(88, 28, 135, 0.94)";
const DESC = "rgba(88, 28, 135, 0.72)";

const CARD_BG = "rgba(255,255,255,0.18)";
const CARD_BORDER = "rgba(255,255,255,0.45)";

export default function MissionResultScreen({ route, navigation }: Props) {
  const { percentage, finalScore, totalQuestions } = route.params;

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [isLoading, setIsLoading] = useState(false);

  // Icon animation
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);

  useEffect(() => {
    // Bounce in animation
    iconScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Continuous rotation
    iconRotate.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      // Fetch next mission
      const nextMissionData = await missionService.next();

      // Navigate to MissionNext with the fetched data
      navigation.navigate("MissionNext", {
        initialData: nextMissionData,
      });
    } catch (error) {
      console.error("Failed to load next mission:", error);
      // If error, just navigate without initial data (will fetch on screen load)
      navigation.navigate("MissionNext");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedAppBackground />

      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + 54,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={[styles.card, { maxWidth: 400 }]}>
          {/* Celebration Icon */}
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <Image
              source={require("../../../assets/img/mission.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Mission Completed!</Text>

          {/* Result Text */}
          <Text style={styles.resultText}>
            You got {finalScore} out of {totalQuestions} correct! ({percentage}%) 🎉
          </Text>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && !isLoading && styles.continueButtonPressed,
              isLoading && styles.continueButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={["rgba(196, 181, 253, 1)", "rgba(167, 139, 250, 1)", "rgba(124, 58, 237, 1)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueButtonGradient}
            >
              <View style={styles.continueButtonInner}>
                <Text style={styles.continueButtonText}>
                  {isLoading ? "Loading..." : "Continue to Next Mission"}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 26,
    backgroundColor: CARD_BG,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontWeight: "800",
    fontSize: 24,
    color: TITLE,
    lineHeight: 32,
    textAlign: "center",
    marginBottom: 12,
  },
  resultText: {
    fontWeight: "700",
    fontSize: 14,
    color: DESC,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 28,
  },
  continueButton: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    // glow + shadow - same as Logout button
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  continueButtonGradient: { padding: 0 },
  continueButtonInner: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  continueButtonPressed: {
    transform: [{ scale: 0.988 }],
    shadowOpacity: 0.16,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontWeight: "900",
    fontSize: 14,
    color: "rgba(76, 29, 149, 0.95)",
    letterSpacing: 0.6,
  },
});