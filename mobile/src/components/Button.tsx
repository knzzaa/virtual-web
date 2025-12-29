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
        colors={["#7c3aed", "#a78bfa", "#6d28d9"]}
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
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  grad: { padding: 0 },
  inner: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  txt: { color: "white", fontWeight: "900", letterSpacing: 0.8 },
  pressed: { transform: [{ scale: 0.985 }], shadowOpacity: 0.1 },
  disabled: { opacity: 0.55 },
});