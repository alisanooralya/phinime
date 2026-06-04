import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useRef, useState, useEffect, memo } from "react";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Button from "@/components/Button";
import Header from "@/components/Header";

import MovieList from "../anime-list/movie";
import OngoingList from "../anime-list/ongoing";
import ScheduleList from "../anime-list/schedule";
import CompletedList from "../anime-list/completed";

const LIST_ITEMS = [
  { title: "Ongoing", icon: "Activity", type: "ongoing" },
  { title: "Completed", icon: "CircleCheck", type: "completed" },
  { title: "Movie", icon: "Clapperboard", type: "movie" },
  { title: "Schedule", icon: "Calendar", type: "schedule" },
];

const PreservedOngoing = memo(OngoingList);
const PreservedCompleted = memo(CompletedList);
const PreservedMovie = memo(MovieList);
const PreservedSchedule = memo(ScheduleList);

export default function ListScreen({ initialParams }: { initialParams?: any }) {
  const [activeType, setActiveType] = useState<string>("ongoing");

  useEffect(() => {
    if (initialParams?.initialType) {
      const type = initialParams.initialType.toLowerCase();
      setActiveType(type);
    }
  }, [initialParams]);

  const renderContent = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.contentArea, activeType !== "ongoing" && styles.hidden]}>
          <PreservedOngoing />
        </View>
        <View style={[styles.contentArea, activeType !== "completed" && styles.hidden]}>
          <PreservedCompleted />
        </View>
        <View style={[styles.contentArea, activeType !== "movie" && styles.hidden]}>
          <PreservedMovie />
        </View>
        <View style={[styles.contentArea, activeType !== "schedule" && styles.hidden]}>
          <PreservedSchedule isEmbedded />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="list anime" />
      
      <View style={styles.categoryWrapper}>
        <View style={styles.gridContainer}>
          {LIST_ITEMS.map((item) => (
            <Button 
              key={item.type}
              button={[styles.categoryCard, activeType === item.type && styles.activeCard]}
              onPress={() => setActiveType(item.type)}
            >
              <View style={[styles.iconBox, activeType === item.type && styles.activeIconBox]}>
                <Icon 
                  name={item.icon as any} 
                  size={20} 
                  color={activeType === item.type ? "#fff" : colors.accent} 
                />
              </View>
              <Text style={[styles.categoryTitle, activeType === item.type && styles.activeTitle]}>
                {item.title}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryWrapper: {
    marginTop: 64,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  gridContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: 179.3,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  activeCard: {
    backgroundColor: colors.accentDark,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBox: {
    backgroundColor: colors.accent,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDark,
  },
  activeTitle: {
    color: colors.text,
  },
  contentArea: {
    flex: 1,
  },
  hidden: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    pointerEvents: "none",
  },
});
