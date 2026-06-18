import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Header from "@/components/Header";
import HistoryScreen from "./HistoryScreen";
import BookmarkScreen from "./BookmarkScreen";

export default function LibraryScreen({
  isActive: isTabActive,
}: {
  isActive?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"history" | "bookmark">("history");
  const [containerWidth, setContainerWidth] = useState(0);
  const scroll = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth === 0) return;

    Animated.spring(slideAnim, {
      toValue: activeTab === "history" ? 0 : containerWidth / 2 - 4,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [activeTab, containerWidth]);

  const onTabLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <Header title="library" scroll={scroll} />

      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer} onLayout={onTabLayout}>
          {containerWidth > 0 && (
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: containerWidth / 2 - 2,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab("bookmark")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "bookmark" && styles.activeTabText,
              ]}
            >
              Bookmark
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={[styles.contentArea, activeTab !== "history" && styles.hidden]}
        >
          <HistoryScreen
            isEmbedded
            isActive={isTabActive && activeTab === "history"}
          />
        </View>
        <View
          style={[
            styles.contentArea,
            activeTab !== "bookmark" && styles.hidden,
          ]}
        >
          <BookmarkScreen
            isEmbedded
            isActive={isTabActive && activeTab === "bookmark"}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabWrapper: {
    paddingHorizontal: 16,
    marginTop: 65,
    marginBottom: 10,
  },
  tabContainer: {
    width: "76%",
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 4,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activeIndicator: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    backgroundColor: colors.accent,
    borderRadius: 21,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
  },
  activeTabText: {
    color: "#fff",
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
