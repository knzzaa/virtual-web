import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import theme from "../styles/theme";

export default function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = "none",
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        placeholderTextColor={"#9ca3af"}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6, fontWeight: "700", color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    backgroundColor: "#fafafa",
    color: theme.colors.text,
  },
});