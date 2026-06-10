import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import BackButton from "@/components/BackButton";

import { Toast } from "@/components/Alert";
import { useToast } from "@/hooks/useAlert";
import {
  getSchedule,
  type ScheduleDay,
  type ScheduleDayData,
  type ScheduleAnimeItem,
} from "@/services/api";

const DAY_ORDER: ScheduleDay[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
  "random",
  "libur",
  "hiatus",
];
const JS_DAY_TO_ID: ScheduleDay[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const DAY_SHORT: Record<string, string> = {
  mon: "Senin",
  tue: "Selasa",
  wed: "Rabu",
  thu: "Kamis",
  fri: "Jum'at",
  sat: "Sabtu",
  sun: "Minggu",
  random: "Random",
  libur: "Libur",
  hiatus: "Hiatus",
};

interface DayPickerProps {
  days: string[];
  selected: string;
  onSelect: (day: string) => void;
}

interface AnimeCardProps {
  item: ScheduleAnimeItem;
  onPress: (slug: string) => void;
  isLast: boolean;
}

function DayPicker({ days, selected, onSelect }: DayPickerProps) {
  return (
    <View style={styles.dayPicker}>
      {days.map((day) => {
        const isActive = day === selected;
        return (
          <Button
            key={day}
            title={DAY_SHORT[day] ?? day}
            onPress={() => onSelect(day)}
            text={[styles.dayNumber, isActive && styles.dayNumberActive]}
            button={[styles.dayItem, isActive && styles.dayItemActive]}
          />
        );
      })}
    </View>
  );
}

function AnimeCard({ item, onPress, isLast }: AnimeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.animeCard, isLast && { marginBottom: 0 }]}
      activeOpacity={0.75}
      onPress={() => onPress(item.slug)}
    >
      <Image
        source={{ uri: item.poster }}
        style={{ width: "25%", height: "100%" }}
        contentFit="cover"
      />

      <View style={styles.cardContent}>
        <Text style={styles.animeTitle} numberOfLines={3}>
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.timelineLine} />
    </TouchableOpacity>
  );
}

function EmptyState({ day }: { day: string }) {
  const dayName = DAY_SHORT[day] ?? day;
  return (
    <View style={styles.emptyWrapper}>
      <Icon name="CalendarX2" size={64} color={colors.accent} />
      <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
      <Text style={styles.emptySubtitle}>
        Tak ada kisah yang menampakkan wujudnya di hari {dayName}. Namun jangan
        risau, esok ia akan kembali menyapamu.
      </Text>
    </View>
  );
}

export default function ScheduleScreen({
  isEmbedded,
}: {
  isEmbedded?: boolean;
}) {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState<
    Record<string, ScheduleDayData>
  >({});
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { state: toastState, error: toastError, hide: hideToast } = useToast();

  const todayId = useMemo(() => JS_DAY_TO_ID[new Date().getDay()], []);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getSchedule();
      if (res.ok) {
        setScheduleData(res.data.schedule);

        if (res.data.schedule[todayId]) {
          setSelectedDay(todayId);
        } else {
          const firstAvailable = DAY_ORDER.find((d) => res.data.schedule[d]);
          setSelectedDay(firstAvailable ?? "");
        }
      } else {
        toastError("Gagal", res.message || "Gagal memuat jadwal.");
      }
    } catch (e) {
      toastError("Gagal", "Tidak dapat memuat jadwal tayang.");
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (slug: string) => {
      router.push(`/detail/${slug}` as any);
    },
    [router],
  );

  const days = useMemo(
    () => DAY_ORDER.filter((d) => scheduleData[d]),
    [scheduleData],
  );

  const activeList = useMemo(
    () => scheduleData[selectedDay]?.anime ?? [],
    [scheduleData, selectedDay],
  );

  const keyExtractor = useCallback((item: ScheduleAnimeItem) => item.slug, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ScheduleAnimeItem; index: number }) => (
      <AnimeCard
        item={item}
        onPress={handlePress}
        isLast={index === activeList.length - 1}
      />
    ),
    [handlePress, activeList.length],
  );

  const Content = (
    <View style={styles.container}>
      {!isEmbedded && (
        <View style={styles.header}>
          <BackButton title="Jadwal Tayang" />
        </View>
      )}

      {loading ? (
        <View style={styles.dayPicker}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.dayItem, { height: 34.2 }]} />
          ))}
        </View>
      ) : (
        <DayPicker
          days={days}
          selected={selectedDay}
          onSelect={setSelectedDay}
        />
      )}

      <View style={styles.divider} />
      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loader visible={loading} />
        </View>
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState day={selectedDay} />}
          ListFooterComponent={<View style={{ marginBottom: "24%" }} />}
        />
      )}
      <Toast {...toastState} onHide={hideToast} />
    </View>
  );

  if (isEmbedded) return Content;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {Content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dayPicker: {
    flexWrap: "wrap",
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  dayItem: {
    width: 86,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: colors.secondary,
    alignItems: "center",
  },
  dayItemActive: {
    backgroundColor: colors.accentDark,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayNumberActive: {
    color: colors.text,
  },
  divider: {
    height: 0.8,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  animeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 100,
  },
  timelineLine: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: colors.accent,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textDark,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    color: colors.textDark,
    fontWeight: "600",
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
