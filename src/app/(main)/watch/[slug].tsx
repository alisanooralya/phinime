import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Animated 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";
import EpisodeCard from "@/components/EpisodeCard";
import Icon from "@/components/Icon";

import { getEpisodeDetail, type EpisodeDetailData } from "@/services/api/endpoints/episode";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WatchScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<EpisodeDetailData | null>(null);
  const scroll = useRef(new Animated.Value(0)).current;

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
      }
    } catch (err) {
      console.error("[WatchScreen] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Loader visible={loading} />
      </View>
    );
  }

  if (!episode) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton title={episode.anime.title} />
      </View>

      <View style={styles.playerContainer}>
        {/* Placeholder for Video Player */}
        <View style={styles.playerPlaceholder}>
          <Icon name="Play" size={48} color="#fff" fill="rgba(255,255,255,0.2)" />
          <Text style={styles.playerText}>Video Player Placeholder</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoSection}>
          <Text style={styles.episodeTitle}>{episode.title}</Text>
          <Text style={styles.animeTitle}>{episode.anime.title}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.episodeListHeader}>
          <Text style={styles.sectionTitle}>Semua Episode</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{episode.otherEpisodes.length} Eps</Text>
          </View>
        </View>

        {episode.otherEpisodes.map((ep) => (
          <EpisodeCard
            key={ep.slug}
            title={ep.title}
            isActive={ep.slug === slug}
            onPress={() => {
              if (ep.slug !== slug) {
                router.push(`/watch/${ep.slug}` as any);
              }
            }}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  playerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  playerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  animeTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 20,
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
});
