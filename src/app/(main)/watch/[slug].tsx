import { useVideoPlayer } from "expo-video";
import { useEffect, useState, useRef } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeCard from "@/components/EpisodeCard";
import usePlaybackSettings from "@/hooks/usePlaybackSettings";

import { Toast } from "@/components/Alert";
import { useToast } from "@/hooks/useAlert";
import { addEpisodeExp } from "@/services/exp";
import { getCurrentUser } from "@/services/auth";
import { saveWatchHistory, getEpisodeProgress } from "@/services/history";
import { getEpisodeDetail, type EpisodeDetailData } from "@/services/api";

export default function WatchScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state: toast, success, info, hide: hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<EpisodeDetailData | null>(null);
  const [activeMirror, setActiveMirror] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preferredQuality, setPreferredQuality] = useState<string>("manual");

  const { autoplay, pip, autonext } = usePlaybackSettings();

  const expAwarded = useRef(false);
  const lastSavedTime = useRef(0);
  const initialProgress = useRef<number | null>(null);
  const autoNavigated = useRef(false);

  useEffect(() => {
    fetchEpisode();
  }, [slug]);

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch((err) =>
        console.error("[WatchScreen] Failed to reset orientation:", err),
      );
    };
  }, []);

  async function fetchEpisode() {
    if (!slug) return;
    try {
      setLoading(true);
      if (player) player.pause();

      const res = await getEpisodeDetail(slug);
      if (res.ok) {
        setEpisode(res.data);

        const quality =
          (await AsyncStorage.getItem("@phinime:video_quality")) || "720p";
        setPreferredQuality(quality);

        if (quality !== "manual") {
          const index = res.data.streamingMirrors.findIndex((m) =>
            m.quality.toLowerCase().includes(quality.toLowerCase()),
          );
          const finalIndex = index !== -1 ? index : 0;
          setActiveMirror(finalIndex);
        } else {
          setActiveMirror(0);
        }

        autoNavigated.current = false;
        expAwarded.current = false;
        lastSavedTime.current = 0;

        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          const progress = await getEpisodeProgress(user.id, slug);
          if (progress) {
            initialProgress.current = progress.progress_ms;
          } else {
            initialProgress.current = 0;
          }
        }
      }
    } catch (err) {
      console.error("[WatchScreen] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const currentMirror = episode?.streamingMirrors[activeMirror];
  const player = useVideoPlayer(currentMirror?.embedUrl || null, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    if (!player) return;

    const performSeek = (timeMs: number) => {
      const timeSec = timeMs / 1000;
      player.currentTime = timeSec;
      if (autoplay) player.play();

      setTimeout(() => {
        if (Math.abs(player.currentTime - timeSec) > 1) {
          player.currentTime = timeSec;
          if (autoplay) player.play();
        }
      }, 500);
    };

    if (player.status === "readyToPlay" && initialProgress.current !== null) {
      if (initialProgress.current > 0) {
        performSeek(initialProgress.current);
      } else {
        if (autoplay) player.play();
      }
      initialProgress.current = null;
    }

    const subscription = player.addListener("statusChange", (event) => {
      const status = typeof event === "object" ? event.status : event;

      if (status === "readyToPlay" && initialProgress.current !== null) {
        if (initialProgress.current > 0) {
          performSeek(initialProgress.current);
        } else {
          if (autoplay) player.play();
        }
        initialProgress.current = null;
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, autoplay]);

  useEffect(() => {
    if (!userId || !episode || !player) return;

    const interval = setInterval(async () => {
      const currentTime = Math.floor(player.currentTime * 1000);
      const duration = Math.floor(player.duration * 1000);

      if (
        currentTime > 0 &&
        Math.abs(currentTime - lastSavedTime.current) > 10000
      ) {
        lastSavedTime.current = currentTime;
        await saveWatchHistory({
          user_id: userId,
          anime_id: episode.slug,
          episode_id: slug!,
          anime_title: episode.title,
          ep_title: `Episode ${episode.episodeNumber}`,
          poster: episode.otherEpisodes.find((e) => e.slug == slug)?.poster,
          progress_ms: currentTime,
          duration_ms: duration,
        });

        if (
          !expAwarded.current &&
          duration > 0 &&
          currentTime / duration > 0.9
        ) {
          expAwarded.current = true;
          const res = await addEpisodeExp(userId);
          if (res?.didLevelUp) {
            success("Level Up!", `Selamat! Kamu naik ke level ${res.newLevel}`);
          } else if (res) {
            info("EXP Bertambah", "Lanjutkan menonton untuk naik level!");
          }
        }

        if (
          autonext &&
          !autoNavigated.current &&
          episode.nextEpisode &&
          duration > 0 &&
          currentTime / duration > 0.995
        ) {
          autoNavigated.current = true;
          router.setParams({ slug: episode.nextEpisode.slug });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, episode, player, slug]);

  if (loading && !episode) {
    return (
      <View style={styles.center}>
        <Loader visible={loading} />
      </View>
    );
  }

  if (!episode) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ animation: "none" }} />
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        duration={toast.duration}
        onHide={hideToast}
      />
      <View style={styles.header}>
        <BackButton title={`Episode ${episode.episodeNumber}`} />
        <Button
          onPress={() => router.push("/(main)/settings/playback")}
          button={styles.headerButton}
          wrapper={styles.headerButtonWrapper}
        >
          <Icon name="Settings" size={20} color={colors.text} />
        </Button>
      </View>

      <View
        style={[
          styles.playerContainer,
          isFullscreen && styles.playerContainerFullscreen,
        ]}
      >
        <VideoPlayer
          player={player}
          title={episode.title}
          loading={loading}
          onFullscreenChange={setIsFullscreen}
          pip={pip}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoSection}>
          <Text style={styles.episodeTitle}>
            Episode {episode.episodeNumber}
          </Text>
          <Text style={styles.animeTitle}>{episode.title}</Text>
        </View>

        {episode.streamingMirrors.length > 1 &&
          preferredQuality === "manual" && (
            <View style={styles.mirrorSection}>
              <Text style={styles.subSectionTitle}>Pilih Server</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mirrorList}
              >
                {episode.streamingMirrors.map((mirror, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setActiveMirror(index)}
                    style={[
                      styles.mirrorButton,
                      activeMirror === index && styles.mirrorButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.mirrorText,
                        activeMirror === index && styles.mirrorTextActive,
                      ]}
                    >
                      {mirror.quality}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

        <View style={styles.navigationSection}>
          <Button
            wrapper={{ flex: 1 }}
            button={[
              styles.navBtn,
              !episode.prevEpisode && styles.navBtnDisabled,
            ]}
            onPress={
              episode.prevEpisode
                ? () => router.setParams({ slug: episode.prevEpisode?.slug })
                : undefined
            }
          >
            <Icon
              name="ChevronLeft"
              size={20}
              color={episode.prevEpisode ? colors.text : colors.textDark}
            />
            <Text
              style={[
                styles.navText,
                !episode.prevEpisode && styles.navTextDisabled,
              ]}
            >
              Prev
            </Text>
          </Button>

          <Button
            wrapper={{ flex: 1 }}
            button={[
              styles.navBtn,
              !episode.nextEpisode && styles.navBtnDisabled,
            ]}
            onPress={
              episode.nextEpisode
                ? () => router.setParams({ slug: episode.nextEpisode?.slug })
                : undefined
            }
          >
            <Text
              style={[
                styles.navText,
                !episode.nextEpisode && styles.navTextDisabled,
              ]}
            >
              Next
            </Text>
            <Icon
              name="ChevronRight"
              size={20}
              color={episode.nextEpisode ? colors.text : colors.textDark}
            />
          </Button>
        </View>

        <View style={styles.divider} />

        <View style={styles.episodeListHeader}>
          <Text style={styles.sectionTitle}>Semua Episode</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {episode.otherEpisodes.length} Eps
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {episode.otherEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.slug}
              title={ep.title}
              subtitle={ep.updatedAt}
              poster={ep.poster}
              onPress={() => {
                if (ep.slug !== slug) {
                  router.setParams({ slug: ep.slug });
                }
              }}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerButtonWrapper: {
    borderRadius: 999,
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  playerContainerFullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: undefined,
    zIndex: 998,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  infoSection: {
    paddingHorizontal: 16,
    gap: 4,
  },
  episodeTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  animeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  mirrorSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  mirrorList: {
    gap: 10,
  },
  mirrorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  mirrorButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  mirrorText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  mirrorTextActive: {
    color: "#FFF",
  },
  navigationSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 24,
  },
  navBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 8,
    height: 44,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  navTextDisabled: {
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 24,
    marginHorizontal: 16,
  },
  episodeListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
  },
});
