import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";

import Loader from "@/components/Loader";
import AnimeCardComponent from "@/components/AnimeCard";
import { getOngoingAnime, type AnimeCard } from "@/services/api";

export default function OngoingList() {
  const router = useRouter();
  const [list, setList] = useState<AnimeCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchOngoing = async (pageNum: number, isRefresh = false) => {
    try {
      if (pageNum > 1) {
        setIsLoadingMore(true);
      } else {
        if (!isRefresh) setLoading(true);
      }

      const response = await getOngoingAnime(pageNum);
      if (response.ok) {
        const newList = response.data.anime;
        if (isRefresh) {
          setList(newList);
          setPage(1);
          setHasMore(newList.length > 0);
        } else {
          setList((prev) => [...prev, ...newList]);
          if (newList.length < 10) setHasMore(false);
        }
      }
    } catch (error) {
      console.error("[OngoingList] Gagal fetch:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOngoing(1);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AnimeCard }) => (
      <AnimeCardComponent
        title={item.title}
        poster={item.poster}
        eps={item.type}
        score={item.score.toString()}
        subTitle={`${item.status || "Ongoing"}, ${item.year}`}
        onPress={() => router.push(`/detail/${item.slug}` as any)}
      />
    ),
    [router],
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <Loader visible={true} />
      </View>
    );
  };

  if (loading && list.length === 0) {
    return (
      <View style={styles.center}>
        <Loader visible={true} />
      </View>
    );
  }

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item, index) => `ongoing-${item.slug}-${index}`}
      numColumns={3}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      scrollIndicatorInsets={{ right: 1 }}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (!loading && !isLoadingMore && hasMore) {
          const next = page + 1;
          setPage(next);
          fetchOngoing(next);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
