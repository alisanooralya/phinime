import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Text";
import Icon from "@/components/Icon";
import colors from "@/constants/colors";

interface SettingToggleRowProps {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4; // 4 = padding kiri+kanan

export default function SettingToggleRow({
  icon,
  iconColor,
  iconBg,
  label,
  description,
  value,
  onValueChange,
}: SettingToggleRowProps) {
  const translateX = useRef(
    new Animated.Value(value ? THUMB_TRAVEL : 0),
  ).current;
  const trackOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? THUMB_TRAVEL : 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 200,
        mass: 0.6,
      }),
      Animated.timing(trackOpacity, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const trackBg = trackOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.12)", colors.accent],
  });

  const thumbScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(thumbScale, {
      toValue: 0.85,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(thumbScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
    onValueChange(!value);
  };

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          iconBg ? { backgroundColor: iconBg } : undefined,
        ]}
      >
        <Icon name={icon as any} size={18} color={iconColor ?? colors.text} />
      </View>

      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      {/* Custom Animated Toggle */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        hitSlop={8}
      >
        <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX }, { scale: thumbScale }],
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.textDark,
    lineHeight: 16,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
