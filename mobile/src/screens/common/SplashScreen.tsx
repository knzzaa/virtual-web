import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.txt}>EnglishLab</Text>
      <Text style={{ opacity: 0.6 }}>Loading...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  txt: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
});