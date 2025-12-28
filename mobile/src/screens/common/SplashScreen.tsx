import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import theme from "../../styles/theme";

export default function SplashScreen() {
  return (
    <View style={styles.wrap}>
      <Image source={require("../../../assets/img/bear.png")} style={styles.logo} />
      <Text style={styles.txt}>EnglishLab</Text>
      <Text style={styles.sub}>Loading...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background },
  logo: { width: 72, height: 72, marginBottom: 10 },
  txt: { fontSize: 28, fontWeight: "900", marginBottom: 6, color: theme.colors.text },
  sub: { opacity: 0.6, color: theme.colors.muted },
});