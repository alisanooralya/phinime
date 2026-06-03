import { useCallback } from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";

import Icon from "../Icon";
import Text from "../Text";
import Loader from "../Loader";
import AnimeCardComponent from "../AnimeCard";

import colors from "@/constants/colors";
import { type AnimeCard } from "@/services/api";

interface AnimeCompletedProps {
  animeList: AnimeCard[];
  loading?: boolean;
}

interface RenderItemProps {
  item: AnimeCard;
  onPress?: () => void;
}

const renderItem = ({ item, onPress }: RenderItemProps) => (
    <AnimeCardComponent
      title={item.title}
      poster={item.poster}
      eps={item.type || undefined}
      score={item.score || undefined}
      subTitle={item.year?.toString()}
      onPress={onPress}
    />
);

export default function AnimeCompleted({ animeList, loading }: AnimeCompletedProps) {
  const router = useRouter();

  const keyExtractor = useCallback((item: animeList) => item.slug, []);
  const handlePress = useCallback(
    (slug: string) => () => router.push(`/detail/${slug}` as any),
    [router],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Anime Completed</Text>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => router.push("/anime-list/completed")}
          activeOpacity={0.8}
        >
          <Text style={styles.scheduleBtnText}>Lihat Semua</Text>
          <Icon name="ChevronRight" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          <Loader visible={loading} />
        </View>
      ) : (
        <FlatList
          data={animeList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
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
    paddingHorizontal: 16,
    gap: 8,
  },
  skeletonRow: {
    height: 126,
  },
});
