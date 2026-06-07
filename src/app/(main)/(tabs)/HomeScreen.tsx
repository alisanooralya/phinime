import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  ScrollView,
} from "react-native";

import colors from "@/constants/colors";
import HomeHeader from "@/components/home/HomeHeader";
import HistorySearch from "@/components/home/HistorySearch";
import UserProfileHome from "@/components/home/UserProfileHome";

import GenreList from "@/components/home/GenreList";
import AnimeTop from "@/components/home/AnimeTop";
import AnimeRecent from "@/components/home/AnimeRecent";
import AnimeOngoing from "@/components/home/AnimeOngoing";
import AnimeCompleted from "@/components/home/AnimeCompleted";

import {
  getPopularAnime,
  getOngoingAnime,
  getRecentAnime,
  getAnimeList,
  type PopularAnimeItem,
  type AnimeCard,
  type RecentAnimeItem,
} from "@/services/api";

interface HomeState {
  top: PopularAnimeItem[];
  recent: RecentAnimeItem[];
  ongoing: AnimeCard[];
  completed: AnimeCard[];
}

export default function Home({
  onNavigateToList,
}: {
  onNavigateToList?: (type: string) => void;
}) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<HomeState | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [po, re, on, co] = await Promise.all([
        getPopularAnime(),
        getRecentAnime(),
        getAnimeList({ status: "ongoing" }),
        getAnimeList({ status: "completed" }),
      ]);

      setData({
        top: po.ok ? po.data.mingguan : [],
        recent: re.ok ? re.data : [],
        ongoing: on.ok ? on.data.anime : [],
        completed: co.ok ? co.data.anime : [],
      });
    } catch (err) {
      console.error("[HomeScreen] Gagal fetch data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <View style={styles.container}>
      <HomeHeader scrollY={scrollY} />
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.secondary}
          />
        }
      >
        <AnimeTop animeList={data?.top || []} />
        <View style={styles.barrier} />

        <UserProfileHome />
        <View style={styles.barrier} />

        <HistorySearch />

        <GenreList />
        <View style={styles.barrier} />

        <AnimeRecent
          animeList={data?.recent || []}
          loading={!data}
          onViewSchedule={() => onNavigateToList?.("Schedule")}
        />
        <View style={styles.barrier} />

        <AnimeOngoing
          animeList={data?.ongoing || []}
          loading={!data}
          onViewAll={() => onNavigateToList?.("Ongoing")}
        />
        <View style={styles.barrier} />

        <AnimeCompleted
          animeList={data?.completed || []}
          loading={!data}
          onViewAll={() => onNavigateToList?.("Completed")}
        />
        <View style={styles.barrier} />

        <View style={styles.padding} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  barrier: {
    marginBottom: 14,
  },
  padding: {
    marginBottom: "24%",
  },
});
