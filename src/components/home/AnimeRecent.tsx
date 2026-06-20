import { useRouter } from "expo-router";
import { useCallback, memo } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

import Icon from "../Icon";
import Text from "../Text";
import Loader from "../Loader";
import AnimeCardComponent from "../AnimeCard";

import colors from "@/constants/colors";
import { type RecentAnimeItem } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 12;
const RECENT_CARD_WIDTH = (SCREEN_WIDTH - (32 + GAP)) / 2;

interface AnimeRecentProps {
  animeList: RecentAnimeItem[];
  loading?: boolean;
  onViewSchedule?: () => void;
}

interface RenderItemProps {
  item: RecentAnimeItem;
  onPress: () => void;
}

const RenderItem = memo(({ item, onPress }: RenderItemProps) => {
  const subtitle = item.episode.includes("Segera")
    ? `${item.episode}, ${item.uploadedAt}`
    : `Episode ${item.episode}, ${item.uploadedAt}`;

  return (
    <AnimeCardComponent
      title={item.title}
      poster={item.poster}
      score={item.status || "End"}
      subTitle={subtitle}
      width={RECENT_CARD_WIDTH}
      onPress={onPress}
    />
  );
});

export default function AnimeRecent({
  animeList,
  loading,
  onViewSchedule,
}: AnimeRecentProps) {
  const router = useRouter();

  const handlePress = useCallback(
    (slug: string) => () => router.push(`/watch/${slug}` as any),
    [router],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Anime Update</Text>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={onViewSchedule}
          activeOpacity={0.8}
        >
          <Text style={styles.scheduleBtnText}>Lihat Jadwal</Text>
          <Icon name="ChevronRight" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading && animeList.length === 0 ? (
        <View style={styles.skeletonRow}>
          <Loader visible={loading} />
        </View>
      ) : (
        <View style={styles.listContent}>
          {animeList.slice(0, 14).map((item) => (
            <RenderItem
              key={item.slug}
              item={item}
              onPress={handlePress(item.slug)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scheduleBtnText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  listContent: {
    flexWrap: "wrap",
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  skeletonRow: {
    height: 126,
  },
});
