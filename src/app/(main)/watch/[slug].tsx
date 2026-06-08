import { useEffect, useState, useRef } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";
import EpisodeCard from "@/components/EpisodeCard";
import { Toast } from "@/components/Alert";
import { getEpisodeDetail, type EpisodeDetailData } from "@/services/api";

import { getCurrentUser } from "@/services/auth";
import { saveWatchHistory, getEpisodeProgress } from "@/services/history";
import { addEpisodeExp } from "@/services/exp";
import { useToast } from "@/hooks/useAlert";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WatchScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state: toast, success, info, hide: hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<EpisodeDetailData | null>(null);
  const [activeMirror, setActiveMirror] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const expAwarded = useRef(false);
  const lastSavedTime = useRef(0);
  const initialProgress = useRef<number | null>(null);

  useEffect(() => {
    fetchEpisode();
  }, [slug]);

  async function fetchEpisode() {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await getEpisodeDetail(slug);
      if (res.ok) {
        setEpisode(res.data);
        setActiveMirror(0);
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
    player.play();
  });

  useEffect(() => {
    if (player && initialProgress.current !== null) {
      if (initialProgress.current > 0) {
        player.currentTime = initialProgress.current / 1000;
      }
      initialProgress.current = null;
    }
  }, [player, episode]);

  useEffect(() => {
    if (!userId || !episode || !player) return;

    const interval = setInterval(async () => {
      const currentTime = Math.floor(player.currentTime * 1000);
      const duration = Math.floor(player.duration * 1000);

      // Save history every 10 seconds or significant jump
      if (
        currentTime > 0 &&
        Math.abs(currentTime - lastSavedTime.current) > 10000
      ) {
        lastSavedTime.current = currentTime;
        await saveWatchHistory({
          user_id: userId,
          anime_id: episode.anime.slug,
          episode_id: slug!,
          anime_title: episode.anime.title,
          ep_title: episode.title,
          poster: episode.otherEpisodes.find((e) => e.slug === slug)?.poster,
          progress_ms: currentTime,
          duration_ms: duration,
        });

        // Check EXP (> 90% watched)
        if (
          !expAwarded.current &&
          duration > 0 &&
          currentTime / duration > 0.9
        ) {
          expAwarded.current = true;
          const res = await addEpisodeExp(userId);
          if (res?.didLevelUp) {
            success(
              "Level Up!",
              `Selamat! Kamu naik ke level ${res.newLevel}`,
            );
          } else if (res) {
            info("EXP Bertambah", "Lanjutkan menonton untuk naik level!");
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, episode, player, slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Loader visible={loading} />
      </View>
    );
  }

  if (!episode) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
      </View>

      <View style={styles.playerContainer}>
        <VideoView
          player={player}
          style={styles.videoPlayer}
          allowsFullscreen
          allowsPictureInPicture
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

        {episode.streamingMirrors.length > 1 && (
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
            onPress={() =>
              episode.prevEpisode &&
              router.push(`/watch/${episode.prevEpisode.slug}` as any)
            }
            disabled={!episode.prevEpisode}
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
            onPress={() =>
              episode.nextEpisode &&
              router.push(`/watch/${episode.nextEpisode.slug}` as any)
            }
            disabled={!episode.nextEpisode}
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

        <View style={styles.episodeGrid}>
          {episode.otherEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.slug}
              title={ep.title}
              subtitle={ep.updatedAt}
              poster={ep.poster}
              onPress={() => {
                if (ep.slug !== slug) {
                  router.push(`/watch/${ep.slug}` as any);
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
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: "#000",
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
  episodeGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
