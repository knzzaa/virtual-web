import React, { useMemo } from "react";
import { useWindowDimensions, Image, View, StyleSheet } from "react-native";
import RenderHTML from "react-native-render-html";

// Map known frontend image filenames to bundled local assets
const LOCAL_IMAGES: Record<string, any> = {
  "books.png": require("../../assets/img/books.png"),
  "clock.png": require("../../assets/img/clock.png"),
  "bear.png": require("../../assets/img/bear.png"),
  "about-us.png": require("../../assets/img/about-us.png"),
  "mission.png": require("../../assets/img/mission.png"),
  "mission-completed.png": require("../../assets/img/mission-completed.png"),
};

function getFilenameFromSrc(src?: string) {
  if (!src) return null;
  const parts = src.split("/");
  return parts.length ? parts[parts.length - 1] : null;
}

function getImageSourceFromSrc(src?: string) {
  const name = getFilenameFromSrc(src);
  if (!name) return null;
  return LOCAL_IMAGES[name] ?? null;
}

function ImgRenderer(props: any) {
  // RenderHTML may pass tnode or attribs depending on version, be permissive
  const attribs = props?.tnode?.attributes ?? props?.attribs ?? {};
  const src: string = attribs.src || "";

  const local = getImageSourceFromSrc(src);

  if (local) {
    return (
      <View style={styles.imgWrap}>
        <Image source={local} style={styles.img} resizeMode="contain" />
      </View>
    );
  }

  // Fallback to rendering remote image URIs directly
  if (src) {
    return (
      <View style={styles.imgWrap}>
        <Image source={{ uri: src }} style={styles.img} resizeMode="contain" />
      </View>
    );
  }

  return null;
}

export default function HtmlContent({ html }: { html: string }) {
  const { width } = useWindowDimensions();

  const processedHtml = useMemo(() => {
    if (!html) return "";
    // Convert frontend relative image paths ../../assets/img/name.png -> local://name.png
    return html.replace(/\.\.\/\.\.\/assets\/img\/([a-zA-Z0-9._-]+)("|'|>)/g, (m, p1, p2) => {
      return `local://${p1}${p2}`;
    });
  }, [html]);

  return (
    <RenderHTML contentWidth={width} source={{ html: processedHtml }} renderers={{ img: ImgRenderer }} />
  );
}

const styles = StyleSheet.create({
  imgWrap: { alignItems: "center", marginVertical: 8 },
  img: { width: "100%", height: 200 },
});
