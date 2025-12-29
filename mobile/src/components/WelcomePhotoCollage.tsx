import React, { memo, useEffect, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Tile = {
  source: any;
  size: number;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  drift: number;
  glow: "purple" | "pink";
};

type Props = {
  /** Collage area height; caller controls layout. */
  height?: number;
};

const IMAGES = [
  require("../../assets/img/bear.png"),
  require("../../assets/img/books.png"),
  require("../../assets/img/clock.png"),
  require("../../assets/img/exam.png"),
  require("../../assets/img/material.png"),
  require("../../assets/img/mission.png"),
  require("../../assets/img/mission-completed.png"),
  require("../../assets/img/about-us.png"),
  require("../../assets/img/profile.png"),
] as const;

function WelcomePhotoCollageBase({ height = 340 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);

  const tiles = useMemo<Tile[]>(() => {
    // Deterministic, so there is no re-layout flicker.
    // Positions are percentage-ish in a fixed canvas.
    return [
      { source: IMAGES[0], size: 88, x: 14, y: 60, rotate: -8, delay: 0, drift: 10, glow: "purple" },
      { source: IMAGES[1], size: 76, x: 54, y: 10, rotate: 10, delay: 120, drift: 14, glow: "pink" },
      { source: IMAGES[2], size: 70, x: 78, y: 92, rotate: -6, delay: 320, drift: 12, glow: "purple" },
      { source: IMAGES[3], size: 82, x: 8, y: 168, rotate: 6, delay: 240, drift: 16, glow: "pink" },
      { source: IMAGES[4], size: 70, x: 74, y: 156, rotate: -12, delay: 520, drift: 12, glow: "purple" },
      { source: IMAGES[5], size: 78, x: 54, y: 214, rotate: 8, delay: 640, drift: 18, glow: "pink" },
      { source: IMAGES[6], size: 62, x: 6, y: 18, rotate: -14, delay: 780, drift: 10, glow: "purple" },
      { source: IMAGES[7], size: 64, x: 40, y: 120, rotate: -4, delay: 860, drift: 14, glow: "pink" },
      { source: IMAGES[8], size: 66, x: 82, y: 38, rotate: 14, delay: 980, drift: 12, glow: "purple" },
    ];
  }, []);

  return (
    <View style={[styles.root, { height }]} pointerEvents="none">
      {tiles.map((tile, idx) => (
        <FloatingTile key={idx} tile={tile} t={t} />
      ))}
    </View>
  );
}

function FloatingTile({ tile, t }: { tile: Tile; t: SharedValue<number> }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withRepeat(
      withDelay(tile.delay, withTiming(1, { duration: 2600 + tile.delay, easing: Easing.inOut(Easing.quad) })),
      -1,
      true
    );
  }, [p, tile.delay]);

  const wrapStyle = useAnimatedStyle(() => {
    const base = t.value;
    const mix = (base + p.value) / 2;
    const dy = interpolate(mix, [0, 1], [-tile.drift, tile.drift]);
    const dx = interpolate(mix, [0, 1], [tile.drift * 0.5, -tile.drift * 0.5]);
    const rot = tile.rotate + interpolate(mix, [0, 1], [-2.5, 2.5]);
    const scale = 1 + interpolate(p.value, [0, 1], [0, 0.05]);
    return {
      transform: [{ translateX: dx }, { translateY: dy }, { rotate: `${rot}deg` }, { scale }],
      opacity: 1,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(p.value, [0, 1], [0.18, 0.42]);
    const scale = interpolate(p.value, [0, 1], [0.95, 1.08]);
    return { opacity, transform: [{ scale }] };
  });

  const glowColor = tile.glow === "pink" ? "rgba(236, 72, 153, 0.55)" : "rgba(167, 139, 250, 0.60)";

  return (
    <Animated.View style={[styles.tileWrap, { left: tile.x, top: tile.y }, wrapStyle]}>
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
            width: tile.size * 1.35,
            height: tile.size * 1.15,
            borderRadius: 999,
          },
          glowStyle,
        ]}
      />
      <View
        style={[
          styles.tile,
          {
            width: tile.size,
            height: tile.size,
            borderRadius: 22,
          },
        ]}
      >
        <Image source={tile.source} style={styles.img} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    width: "100%",
  },
  tileWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    shadowColor: "rgba(167, 139, 250, 1)",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  tile: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default memo(WelcomePhotoCollageBase);
