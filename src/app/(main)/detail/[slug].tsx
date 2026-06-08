import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image as Img,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import AnimeBatch from "@/components/AnimeBatch";
import BackButton from "@/components/BackButton";
import EpisodeCard from "@/components/EpisodeCard";
import AnimeCard from "@/components/AnimeCard";

import { getCurrentUser } from "@/services/auth";
import { toggleBookmark, isBookmarked } from "@/services/bookmark";
import { getAnimeDetail, type AnimeDetailData } from "@/services/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const POSTER_HEIGHT = SCREEN_HEIGHT * 0.42;

function GenreBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export default function DetailAnimeScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState<AnimeDetailData | null>(null);

  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [bookmarked, setBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchDetail = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const res = await getAnimeDetail(slug);
      if (res.ok) {
        setAnime(res.data);

        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          const isFav = await isBookmarked(user.id, slug);
          setBookmarked(isFav);
        }
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleToggleBookmark = async () => {
    if (!userId || !anime) return;

    const newState = await toggleBookmark({
      user_id: userId,
      anime_id: slug!,
      anime_title: anime?.title,
      poster: anime?.poster,
      status: anime?.status,
      score: anime?.score,
    });

    setBookmarked(newState);
  };

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [POSTER_HEIGHT - 80, POSTER_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <Loader visible={loading} />
      </View>
    );
  }
  if (!anime) return null;

  const synopsisText = anime?.synopsis;
  const SYNOPSIS_LINES = synopsisExpanded ? undefined : 4;

  const visibleEpisodes = anime?.episodes.slice(0, displayLimit);
  const hasMoreEpisodes = anime?.episodes.length > displayLimit;

  return (
    <View style={styles.root}>
      <Animated.View
        style={[styles.floatingHeader, { paddingTop: insets.top }]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: colors.background, opacity: headerBgOpacity },
          ]}
        />
        <BackButton />
        <Button button={styles.headerBtn} onPress={handleToggleBookmark}>
          <Icon
            name={bookmarked ? "Bookmark" : "BookmarkPlus"}
            size={20}
            color={bookmarked ? colors.accent : "#fff"}
          />
          <Text
            style={[
              styles.headerBtnLabel,
              bookmarked && { color: colors.accent },
            ]}
          >
            {bookmarked ? "Tersimpan" : "Simpan"}
          </Text>
        </Button>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroContainer}>
          <Img
            source={{ uri: anime.poster }}
            style={StyleSheet.absoluteFillObject}
            blurRadius={18}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)", colors.background]}
            locations={[0.3, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.posterWrapper}>
            <Image
              source={{ uri: anime.poster }}
              style={styles.poster}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.alternative}>{anime.alternative}</Text>
          <Text style={styles.title}>{anime.title}</Text>

          <View style={styles.metaRow}>
            {[anime?.type, anime?.status, anime?.year]
              .filter(Boolean)
              .map((m, i) => (
                <View key={i} style={styles.metaRow}>
                  {i > 0 && (
                    <Text style={{ color: colors.textSecondary }}>|</Text>
                  )}
                  <Text style={styles.metaText}>{m}</Text>
                </View>
              ))}
          </View>

          <View style={styles.genreRow}>
            {anime.genres.map((g) => (
              <GenreBadge key={g.slug} label={g.name} />
            ))}
          </View>

          <View style={styles.scoreRow}>
            <Icon name="Star" size={22} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.scoreValue}>{anime?.score || "N/A"}</Text>
            <Text style={styles.scoreLabel}>/ 10</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsisText} numberOfLines={SYNOPSIS_LINES}>
            {synopsisText}
          </Text>

          <TouchableOpacity
            style={styles.synopsisToggle}
            onPress={() => setSynopsisExpanded((e) => !e)}
            activeOpacity={0.7}
          >
            <Text style={styles.synopsisToggleText}>
              {synopsisExpanded ? "Sembunyikan" : "Selengkapnya"}
            </Text>
            <Icon
              name={synopsisExpanded ? "ChevronUp" : "ChevronDown"}
              size={16}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Episode</Text>
            <View style={styles.epCountBadge}>
              <Text style={styles.epCountText}>
                {anime?.episodes.length} Eps
                {anime.episode && ` / ${anime.episode} Eps`}
              </Text>
            </View>
          </View>

          {visibleEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.slug}
              title={ep.title}
              subtitle={ep.updatedAt}
              poster={anime.poster}
              onPress={() => {
                router.push(`/watch/${ep.slug}` as any);
              }}
            />
          ))}

          {hasMoreEpisodes && (
            <View style={styles.epActions}>
              <Button
                button={styles.epActionBtn}
                onPress={() => setDisplayLimit((prev) => prev + 12)}
              >
                <Text style={styles.epActionText}>Tampilkan Lagi</Text>
                <Icon name="ChevronDown" size={16} color={colors.accent} />
              </Button>

              <Button
                button={styles.epActionBtn}
                onPress={() => setDisplayLimit(anime?.episodes.length)}
              >
                <Text style={styles.epActionText}>Tampilkan Semua</Text>
                <Icon name="ChevronsDown" size={16} color={colors.accent} />
              </Button>
            </View>
          )}
        </View>

        {anime.batchDownloads && anime.batchDownloads.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Batch Download</Text>
              {anime.batchDownloads.map((batch: any, i: number) => (
                <AnimeBatch
                  key={i}
                  title={batch.title || `${anime.title} Batch`}
                  batchId={batch.slug || ""}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Durasi</Text>
              <Text style={styles.detailValue}>{anime.duration || "-"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Musim</Text>
              <Text style={styles.detailValue}>{anime.season || "-"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Studio</Text>
              <Text style={styles.detailValue}>{anime.studio || "-"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Produser</Text>
              <Text style={styles.detailValue}>{anime.producer || "-"}</Text>
            </View>
          </View>

          {anime.directors && anime.directors.length > 0 && (
            <View style={styles.listDetail}>
              <Text style={styles.detailLabel}>Director</Text>
              <Text style={styles.detailValue}>
                {anime.directors.map((d) => d.name).join(", ")}
              </Text>
            </View>
          )}

          {anime.cast && anime.cast.length > 0 && (
            <View style={styles.listDetail}>
              <Text style={styles.detailLabel}>Cast</Text>
              <View style={styles.castRow}>
                {anime.cast.map((c, i) => (
                  <View key={i} style={styles.badgeCast}>
                    <Text style={styles.badgeText}>{c.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {anime.gallery && anime.gallery.length > 0 && (
            <View style={styles.listDetail}>
              <Text style={styles.detailLabel}>Gallery</Text>
              <View style={styles.castRow}>
                {anime.gallery.map((g, i) => (
                  <View key={i} style={styles.gallery}>
                    <Image
                      source={{ uri: g }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {anime.relatedAnime && anime.relatedAnime.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rekomendasi Terkait</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {anime.relatedAnime.map((rel, i) => (
                  <AnimeCard
                    key={i}
                    title={rel.title}
                    poster={rel.poster}
                    score={rel.score?.toString()}
                    subTitle={rel.type}
                    onPress={() => {
                      router.push(`/detail/${rel.slug}` as any);
                    }}
                    width={120}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <View style={{ marginBottom: "24%" }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    flexDirection: "row",
    height: 40,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: colors.secondary,
  },
  headerBtnLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  heroContainer: {
    height: POSTER_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  posterWrapper: {
    width: SCREEN_WIDTH * 0.46,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },
  alternative: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  genreRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  divider: {
    height: 0.8,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginVertical: 14,
  },
  section: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  epCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: colors.accent + "22",
    borderWidth: 0.8,
    borderColor: colors.accent + "55",
  },
  epCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
  },
  synopsisText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  synopsisToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  synopsisToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  epActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  epActionBtn: {
    width: 172,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.08)",
  },
  epActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 10,
  },
  detailItem: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textDark,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  listDetail: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  relatedList: {
    gap: 8,
    marginTop: 12,
  },
  badgeCast: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  castRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  gallery: {
    width: 108,
    height: 150,
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },
});
