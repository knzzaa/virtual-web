import { Platform } from "react-native";

export const colors = {
  primary: "#222",
  background: "#ffffff",
  card: "#ffffff",
  border: "#eeeeee",
  text: "#111111",
  muted: "#6b7280",
  success: "#16a34a",
  accent: "#2563eb",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const card = {
  padding: 14,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
};

// Basic shadow helper for iOS/Android
export const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  android: { elevation: 2 },
  default: {},
});

const theme = { colors, spacing, radius, card, shadow };

export default theme;
