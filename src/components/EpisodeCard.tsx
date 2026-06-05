import { useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
} from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import colors from "@/constants/colors";

interface EpisodeCardProps {
  title: string;
  onPress: () => void;
  isActive?: boolean;
  isWatched?: boolean;
}

export default function EpisodeCard({ 
  title, 
  onPress, 
  isActive = false,
  isWatched = false 
}: EpisodeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
      style={[
        styles.container, 
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.touchable,
          isActive && styles.activeCard,
          isWatched && !isActive && styles.watchedCard
        ]}
      >
        {isActive && (
          <LinearGradient
            colors={[colors.accent + "33", colors.accent + "05"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
          <Icon 
            name={isActive ? "Pause" : "Play"} 
            size={18} 
            color={isActive ? "#fff" : (isWatched ? colors.textDark : colors.accent)}
            fill={isActive ? "#fff" : "transparent"}
          />
        </View>

        <View style={styles.content}>
          <Text 
            style={[
              styles.title, 
              isActive && styles.activeText,
              isWatched && !isActive && styles.watchedText
            ]} 
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {isActive ? "Sedang diputar" : isWatched ? "Sudah ditonton" : "Klik untuk menonton"}
          </Text>
        </View>

        {isWatched && !isActive && (
          <View style={styles.checkIcon}>
            <Icon name="Check" size={14} color={colors.accent} />
          </View>
        )}
        
        {!isWatched && !isActive && (
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.15)" />
        )}
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  activeCard: {
    borderColor: colors.accent,
    backgroundColor: "rgba(255,107,0,0.1)",
  },
  watchedCard: {
    opacity: 0.8,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconWrapper: {
    backgroundColor: colors.accent,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  activeText: {
    color: colors.accent,
  },
  watchedText: {
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textDark,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,107,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
