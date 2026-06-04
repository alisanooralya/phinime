import { useRouter } from "expo-router";
import { useCallback, memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Icon from "../Icon";
import Text from "../Text";
import Loader from "../Loader";
import AnimeCardComponent from "../AnimeCard";

import colors from "@/constants/colors";
import { type AnimeCard } from "@/services/api";

interface AnimeRecentProps {
  animeList: AnimeCard[];
  loading?: boolean;
  onViewSchedule?: () => void;
}

interface RenderItemProps {
  item: AnimeCard;
  onPress?: () => void;
}

const RenderItem = memo(({ item, onPress }: RenderItemProps) => {
  return (
    <AnimeCardComponent
      title={item.title}
      poster={item.poster}
      eps={item.status || undefined}
      subTitle={item.year?.toString()}
      onPress={onPress}
    />
  );
});

export default function AnimeRecent({ 
  animeList, 
  loading,
  onViewSchedule 
}: AnimeRecentProps) {
  const router = useRouter();

  const handlePress = useCallback(
    (slug: string) => () => router.push(`/detail/${slug}` as any),
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
          {animeList.slice(0, 15).map((item) => (
            <View key={item.slug}>
              <RenderItem item={item} onPress={handlePress(item.slug)} />
            </View>
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
