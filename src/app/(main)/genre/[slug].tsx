import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";
import AnimeCardComponent from "@/components/AnimeCard";
import { getGenreDetail, getGenres, type AnimeCard } from "@/services/api";

export default function GenreDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [animeList, setAnimeList] = useState<AnimeCard[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [slug]);

  const fetchInitialData = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      const genresResponse = await getGenres();
      const currentGenre = genresResponse.data.genres.find(
        (g) => g.slug === slug,
      );
      if (currentGenre) {
        setGenreTitle(currentGenre.name);
      }

      const animeResponse = await getGenreDetail(slug, 1);
      setAnimeList(animeResponse.data.anime);
      setPage(1);
      setHasMore(
        animeResponse.data.anime.length > 0 &&
          animeResponse.data?.lastPage !== 0,
      );
    } catch (error) {
      console.error("[GenreDetailScreen] Gagal fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async () => {
    if (isLoadingMore || !hasMore || !slug) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const animeResponse = await getGenreDetail(slug, nextPage);

      if (animeResponse.data.anime.length > 0) {
        setAnimeList((prev) => [...prev, ...animeResponse.data.anime]);
        setPage(nextPage);
        setHasMore(animeResponse.data?.lastPage !== 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[GenreDetailScreen] Gagal fetch lebih banyak:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderAnimeCard = useCallback(
    ({ item }: { item: AnimeCard }) => (
      <AnimeCardComponent
        title={item.title}
        poster={item.poster}
        eps={item.type || undefined}
        score={item.score.toString() || undefined}
        subTitle={`${item.status || "Completed"}, ${item.year}`}
        onPress={() => router.push(`/detail/${item.slug}` as any)}
      />
    ),
    [router],
  );

  const keyExtractor = useCallback((item: AnimeCard) => item.slug, []);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Loader visible={isLoadingMore} />
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton title={genreTitle || "Loading..."} />
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <Loader visible={loading} />
            </View>
          ) : (
            <FlatList
              data={animeList}
              renderItem={renderAnimeCard}
              keyExtractor={keyExtractor}
              numColumns={3}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              scrollIndicatorInsets={{ right: 1 }}
              showsVerticalScrollIndicator={false}
              onEndReached={fetchMoreData}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
