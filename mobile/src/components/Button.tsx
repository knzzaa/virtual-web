import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
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
    <Pressable style={[styles.btn, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.txt}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  txt: { color: "white", fontWeight: "600" },
  disabled: { opacity: 0.5 },
});