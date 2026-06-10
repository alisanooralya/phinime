import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import Text from "@/components/Text";
import OnBoarding, { OnBoardingData } from "@/constants/onboarding";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < OnBoarding.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    router.replace("/(auth)/login");
  };

  const isLast = currentIndex === OnBoarding.length - 1;
  const renderItem = ({ item }: { item: OnBoardingData }) => (
    <View style={styles.slide}>
      <Image
        source={item.image as any}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.gradient} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.FlatList
        ref={flatListRef}
        data={OnBoarding}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFillObject}
      />

      {!isLast && (
        <SafeAreaView style={styles.skipWrapper} edges={["top"]}>
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <SafeAreaView style={styles.bottomWrapper} edges={["bottom"]}>
        <View style={styles.textContainer}>
          {OnBoarding.map((item, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: "clamp",
            });

            const translateX = scrollX.interpolate({
              inputRange,
              outputRange: [width * 0.3, 0, -width * 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.textSlide,
                  { opacity, transform: [{ translateX }] },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.title}>{item.text}</Text>
                <Text style={styles.subtitle}>{item.text2}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.dotsRow}>
          {OnBoarding.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.btn, isLast && styles.btnLast]}
          onPress={goToNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, isLast && styles.btnTextLast]}>
            {isLast ? "Mulai Sekarang" : "Lanjut"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slide: {
    width,
    height,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    background: "transparent",
    backgroundColor: "transparent",
  },
  skipWrapper: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: 20,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 28,
    paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingTop: 32,
  },
  textContainer: {
    height: 140,
    marginBottom: 28,
  },
  textSlide: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
    fontWeight: "400",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  btnLast: {
    backgroundColor: "#6C5CE7",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0a0a",
  },
  btnTextLast: {
    color: "#fff",
  },
});
