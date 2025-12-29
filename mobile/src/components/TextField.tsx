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
  const [focused, setFocused] = React.useState(false);

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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6, fontWeight: "800", color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.14)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    color: "#111827",
  },
  inputFocused: {
    borderColor: "rgba(124, 58, 237, 0.7)",
    shadowColor: "rgba(124, 58, 237, 1)",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});