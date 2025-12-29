import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../styles/theme";

export default function Button({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <LinearGradient
        // light purple with a bit of depth
        colors={["rgba(196, 181, 253, 1)", "rgba(167, 139, 250, 1)", "rgba(124, 58, 237, 1)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.grad}
      >
        <View style={styles.inner}>
          <Text style={styles.txt}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 18,
    overflow: "hidden",
    // glow + shadow
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  grad: { padding: 0 },
  inner: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  txt: { color: "rgba(76, 29, 149, 0.95)", fontWeight: "900", letterSpacing: 0.6 },
  pressed: {
    transform: [{ scale: 0.988 }],
    shadowOpacity: 0.16,
  },
  disabled: { opacity: 0.55 },
});