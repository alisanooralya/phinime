import { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Image } from "expo-image";

import Text from "./Text";
import colors from "@/constants/colors";

interface EpisodeCardProps {
  title: string;
  subtitle?: string;
  poster?: string;
  onPress: () => void;
}

export default function EpisodeCard({
  title,
  subtitle,
  poster,
  onPress,
}: EpisodeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: poster || "" }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbnailContainer: {
    width: 140,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textDark,
  },
});
