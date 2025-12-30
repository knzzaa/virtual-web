import React, { useMemo, useState } from "react";
import { useWindowDimensions, Image, View, StyleSheet, Pressable, Text, Linking } from "react-native";
import RenderHTML from "react-native-render-html";
import YoutubePlayer from "react-native-youtube-iframe";

function extractYouTubeEmbedUrls(html: string) {
  const urls: string[] = [];
  if (!html) return urls;

  // Grab iframe src attributes
  const re = /<iframe[^>]+src=["']([^"']+)["'][^>]*><\/iframe>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const src = m[1];
    if (/^(https?:\/\/)?(www\.)?youtube\.com\/embed\//i.test(src)) urls.push(src);
  }
  return urls;
}

function getYouTubeWatchUrlFromEmbed(embedUrl: string) {
  // https://www.youtube.com/embed/<id>?si=... -> https://www.youtube.com/watch?v=<id>
  const m = embedUrl.match(/youtube\.com\/embed\/([^?&/]+)/i);
  if (!m) return embedUrl;
  return `https://www.youtube.com/watch?v=${m[1]}`;
}

function getYouTubeIdFromEmbed(embedUrl: string) {
  const m = embedUrl.match(/youtube\.com\/embed\/([^?&/]+)/i);
  return m?.[1] ?? null;
}

function YouTubeCard({ src, width }: { src: string; width: number }) {
  // Keep the video smaller so it looks neat inside the detail layout.
  // Make the card a bit narrower than screen and cap its max width for neat layout.
  const maxCardWidth = 320;
  const horizontalInset = 48; // leave padding left/right so it doesn't touch edges
  const cardWidth = Math.min(Math.max(width - horizontalInset, 220), maxCardWidth);
  const height = Math.round((cardWidth * 9) / 16);
  const [failed, setFailed] = useState(false);
  const videoId = getYouTubeIdFromEmbed(src);

  const onFail = () => setFailed(true);

  return (
    <View style={styles.videoWrap}>
      <View style={[styles.videoCard, { width: cardWidth }]}>
        <View style={styles.videoFrame}>
          {!failed && videoId ? (
            <YoutubePlayer
              height={height}
              width={cardWidth}
              play={false}
              videoId={videoId}
              initialPlayerParams={{
                modestbranding: true,
                rel: false,
                playsinline: true,
              }}
              onError={onFail}
            />
          ) : (
            <Pressable
              style={[styles.fallback, { height }]}
              onPress={() => Linking.openURL(getYouTubeWatchUrlFromEmbed(src))}
            >
              {videoId ? (
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.fallbackOverlay} />
              <View style={styles.playBadge}>
                <Text style={styles.playText}>▶</Text>
              </View>
              <Text style={styles.fallbackText}>Open on YouTube</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

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

function IframeRenderer(props: any) {
  const attribs = props?.tnode?.attributes ?? props?.attribs ?? {};
  const src: string = attribs.src || "";

  // Only handle YouTube embeds for safety and UX consistency.
  const isYouTube = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\//i.test(src);
  if (!src || !isYouTube) return null;

  // We render YouTube using react-native-youtube-iframe (above the HTML) for reliability.
  // Returning null here avoids duplicate video blocks inside the rendered HTML.
  return null;
}

export default function HtmlContent({ html }: { html: string }) {
  const { width } = useWindowDimensions();

  const processedHtml = useMemo(() => {
    if (!html) return "";
    // Convert frontend relative image paths ../../assets/img/name.png -> local://name.png
    let out = html.replace(/\.\.\/\.\.\/assets\/img\/([a-zA-Z0-9._-]+)("|'|>)/g, (m, p1, p2) => {
      return `local://${p1}${p2}`;
    });

    // Some HTML sources use self-closing iframes or omit closing tags.
    // Normalize YouTube iframes so RenderHTML can reliably parse them.
    out = out.replace(
      /<iframe([^>]+)><\/iframe>/gi,
      (all) => all // no-op; placeholder to keep structure
    );

    return out;
  }, [html]);

  const embedUrls = useMemo(() => extractYouTubeEmbedUrls(processedHtml), [processedHtml]);

  // Match writing style like the screenshot: colored headings, compact body, nice blockquotes/lists.
  const baseStyle = useMemo(
    () => ({
      color: "#111111",
      fontSize: 14,
      lineHeight: 22,
    }),
    []
  );

  const tagsStyles = useMemo(
    () => ({
      // Titles: dark purple, slightly larger, medium-bold (not too heavy)
      h1: {
        color: "rgba(76, 29, 149, 0.96)",
        fontSize: 24,
        lineHeight: 30,
        fontWeight: "700",
        marginTop: 4,
        marginBottom: 10,
      },
      h2: {
        color: "rgba(76, 29, 149, 0.94)",
        fontSize: 19,
        lineHeight: 25,
        fontWeight: "700",
        marginTop: 18,
        marginBottom: 8,
      },
      // Section points (e.g. Simple Present Tense): light-purple and bold
      h3: {
        color: "rgba(124, 58, 237, 0.86)",
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "800",
        marginTop: 14,
        marginBottom: 6,
      },
      // Subsection title inside list items (this is what should be bold)
      h4: {
        color: "rgba(76, 29, 149, 0.92)",
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "700",
        marginTop: 0,
        marginBottom: 6,
      },
      p: { marginTop: 0, marginBottom: 10 },

      // Lists: keep item text regular; only headings (h4) and explicit <b>/<strong> should be bold.
      // Using a smaller left padding makes the number + title feel more aligned and tidy.
      ol: { paddingLeft: 14, marginBottom: 12 },
      ul: { paddingLeft: 14, marginBottom: 12 },
      li: {
        marginBottom: 14,
        color: "rgba(17,17,17,0.78)",
        fontWeight: "400",
      },

      // Inline emphasis
      strong: { fontWeight: "700", color: "rgba(76, 29, 149, 0.92)" },
      b: { fontWeight: "700", color: "rgba(76, 29, 149, 0.92)" },
      em: { fontStyle: "italic" },
      code: {
        backgroundColor: "rgba(0,0,0,0.04)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
      },

      // Paragraphs used by seed HTML
      div: { marginBottom: 10 },
    }),
    []
  );

  const classesStyles = useMemo(
    () => ({
      // Seed HTML uses these classes; styling them gives us good formatting without brittle regex.
      "content-card": {
        marginBottom: 12,
      },
      "section-header": {
        color: "rgba(76, 29, 149, 0.92)",
        fontSize: 17,
        lineHeight: 23,
        fontWeight: "700",
        marginTop: 6,
        marginBottom: 8,
      },
      "subsection-header": {
        color: "rgba(76, 29, 149, 0.92)",
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "700",
        // Keep the header visually aligned with the list number.
        marginTop: 0,
        marginBottom: 6,
      },
      "content-text": {
        color: "rgba(17,17,17,0.78)",
        fontSize: 14,
        lineHeight: 22,
      },
      // Example blocks: user asked not to box them; keep them as clean indented groups.
      "example-box": {
        marginTop: 6,
        marginBottom: 12,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: "rgba(124, 58, 237, 0.18)",
      },
      "example-box_p": { marginTop: 0, marginBottom: 8, color: "rgba(88, 28, 135, 0.78)", fontWeight: "400" },
      "example-box_i": { color: "rgba(88, 28, 135, 0.78)", fontStyle: "italic" },
    }),
    []
  );

  return (
    <View>
      {/* Render the first YouTube embed as a dedicated player card for neat layout. */}
      {embedUrls[0] ? <YouTubeCard src={embedUrls[0]} width={width} /> : null}

      <RenderHTML
        contentWidth={width}
        source={{ html: processedHtml }}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles as any}
        classesStyles={classesStyles as any}
        renderers={{ img: ImgRenderer, iframe: IframeRenderer }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imgWrap: { alignItems: "center", marginVertical: 8 },
  img: { width: "100%", height: 200 },
  iframeWrap: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 16,
    marginVertical: 10,
  },

  videoWrap: {
    alignItems: "center",
  },
  videoCard: {
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  videoFrame: {
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#000",
  },
  fallback: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  playBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  playText: { fontSize: 22, fontWeight: "900", color: "rgba(88, 28, 135, 0.92)", marginLeft: 2 },
  fallbackText: { fontSize: 13, fontWeight: "800", color: "rgba(255,255,255,0.92)" },
});
