import React, { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Static background: keep it simple and stable.

type Props = {
  children?: React.ReactNode;
};

/**
 * Subtle moving pastel-purple gradient background for main app screens.
 * Lighter + calmer than auth background, so content stays readable.
 */
function AnimatedAppBackgroundBase({ children }: Props) {
  const colors = useMemo(
    // Static: transparent-ish light purple -> white (white at the bottom)
    () => ["rgba(167,139,250,0.28)", "rgba(196,181,253,0.20)", "#ffffff"] as const,
    []
  );

  return (
    <View style={styles.root} pointerEvents="box-none">
      <LinearGradient
        pointerEvents="none"
        colors={colors}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* subtle depth */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.00)", "rgba(17, 24, 39, 0.03)"]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default memo(AnimatedAppBackgroundBase);
