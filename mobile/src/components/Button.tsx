import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

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
  btn: { padding: 12, borderRadius: 10, backgroundColor: "#222", alignItems: "center" },
  txt: { color: "white", fontWeight: "600" },
  disabled: { opacity: 0.5 },
});