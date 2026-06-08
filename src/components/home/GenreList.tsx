import { useRouter } from "expo-router";
import { useEffect, useState, memo, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";

import Text from "../Text";

import colors from "@/constants/colors";
import { getGenres, type Genre } from "@/services/api";

interface GenreChipProps {
  item: Genre;
  onPress: () => void;
}

function SkeletonChip() {
  return <View style={styles.skeletonChip} />;
}

const GenreChip = memo(({ item, onPress }: GenreChipProps) => (
  <TouchableOpacity style={styles.chip} activeOpacity={0.8} onPress={onPress}>
    <Text style={styles.chipText}>{item.name}</Text>
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{item.count}</Text>
    </View>
  </TouchableOpacity>
));

export default function GenreList() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await getGenres();
      if (response.ok) {
        setGenres(response.data.genres);
      }
    } catch (err) {
      console.error("[GenreList] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (slug: string) => () => router.push(`/genre/${slug}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Genre }) => (
      <GenreChip item={item} onPress={handlePress(item.slug)} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Genre) => item.slug, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Genre</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          {[...Array(5)].map((_, i) => (
            <SkeletonChip key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={genres}
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  chipText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
  },
  countBadge: {
    backgroundColor: colors.accentDark + "55",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  skeletonChip: {
    width: 90,
    height: 38,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
});
