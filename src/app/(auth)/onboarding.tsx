import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState, memo, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import Text from "@/components/Text";
import Icon from "@/components/Icon";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Toast } from "@/components/Alert";
import { useToast } from "@/hooks/useAlert";
import { signInWithGoogle } from "@/services/auth";
import OnBoarding, { OnBoardingData } from "@/constants/onboarding";

const ARROW_BTN_SIZE = 56;
const LAST_BTN_WIDTH = 140;
const { width, height } = Dimensions.get("window");

const Dot = memo(({ active }: { active: boolean }) => {
  const opacityAnim = useRef(new Animated.Value(active ? 1 : 0.3)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: active ? 1 : 0.3,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [active]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: opacityAnim,
          backgroundColor: active ? colors.accent : "rgba(255,255,255,0.4)",
        },
      ]}
    />
  );
});

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: OnBoardingData;
  index: number;
  scrollX: Animated.Value;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [translateY]);

  const translateX = scrollX.interpolate({
    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
    outputRange: [width * 0.35, 0, -width * 0.35],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.illustrationBox,
          { transform: [{ translateY }, { translateX }] },
        ]}
      >
        <Image
          source={item.image}
          style={styles.image}
          contentFit="contain"
          transition={500}
        />
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const { state: toastState, success, error, hide } = useToast();

  const onboardingTranslateY = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(height)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;

  const btnWidth = useRef(new Animated.Value(ARROW_BTN_SIZE)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const smoothScrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const isLast = currentIndex === OnBoarding.length - 1;

  useEffect(() => {
    if (isLast) {
      Animated.parallel([
        Animated.timing(arrowOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(btnWidth, {
          toValue: LAST_BTN_WIDTH,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(btnWidth, {
          toValue: ARROW_BTN_SIZE,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isLast]);

  const goToNext = () => {
    if (currentIndex < OnBoarding.length - 1) {
      smoothScrollToIndex(currentIndex + 1);
    } else {
      triggerLoginTransition();
    }
  };

  const skipToLast = () => {
    smoothScrollToIndex(OnBoarding.length - 1);
  };

  const triggerLoginTransition = () => {
    setShowLogin(true);
    Animated.parallel([
      Animated.timing(onboardingTranslateY, {
        toValue: -height,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(loginTranslateY, {
        toValue: 0,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(loginOpacity, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goBackToOnboarding = () => {
    Animated.parallel([
      Animated.timing(onboardingTranslateY, {
        toValue: 0,
        duration: 580,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(loginTranslateY, {
        toValue: height,
        duration: 580,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(loginOpacity, {
        toValue: 0,
        duration: 580,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setShowLogin(false));
  };

  const handleGoogle = async () => {
    setLoginLoading(true);
    const result = await signInWithGoogle();
    setLoginLoading(false);

    if (result.success) {
      try {
        await AsyncStorage.setItem("isLoggedIn", "true");
      } catch (err) {}

      success("Berhasil Login", "Selamat datang kembali!");
      setTimeout(() => {
        router.replace("/(main)/(tabs)");
      }, 1500);
    } else {
      const msg =
        typeof result.error === "string" ? result.error : "Terjadi kesalahan";
      error("Login Gagal", msg);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateY: onboardingTranslateY }] },
        ]}
        pointerEvents={showLogin ? "none" : "auto"}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <Animated.FlatList
            ref={flatListRef}
            data={OnBoarding}
            renderItem={({ item, index }) => (
              <SlideItem item={item} index={index} scrollX={scrollX} />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="normal"
            style={styles.flatList}
          />

          <View style={styles.bottomPanel}>
            <View style={styles.dotsRow}>
              {OnBoarding.map((_, index) => (
                <Dot key={index} active={index === currentIndex} />
              ))}
            </View>

            <View style={styles.textArea}>
              {OnBoarding.map((item, index) => {
                const opacity = scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0, 1, 0],
                  extrapolate: "clamp",
                });
                return (
                  <Animated.View
                    key={item.id}
                    style={[styles.textSlide, { opacity }]}
                    pointerEvents="none"
                  >
                    <Text style={styles.title}>{item.text}</Text>
                    <Text style={styles.subtitle}>{item.text2}</Text>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              {!isLast ? (
                <TouchableOpacity onPress={skipToLast}>
                  <Text style={styles.skipText}>Lewati</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <TouchableOpacity onPress={goToNext} activeOpacity={0.85}>
                <Animated.View
                  style={[
                    styles.arrowBtn,
                    { width: btnWidth, backgroundColor: colors.accent },
                  ]}
                >
                  <Animated.View
                    style={{ opacity: arrowOpacity, position: "absolute" }}
                  >
                    <Icon
                      name="ArrowRight"
                      color={colors.background}
                      size={24}
                    />
                  </Animated.View>
                  <Animated.View style={{ opacity: textOpacity }}>
                    <Text style={styles.startText}>Login</Text>
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateY: loginTranslateY }],
            opacity: loginOpacity,
          },
        ]}
        pointerEvents={showLogin ? "auto" : "none"}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.loginContainer}>
            <View style={styles.loginBranding}>
              <View style={styles.loginLogoBox}>
                <Image
                  source={require("@/assets/icon.svg")}
                  contentFit="contain"
                  style={{ width: 44, height: 44 }}
                />
              </View>
              <Text style={styles.loginAppName}>phinime</Text>
              <Text style={styles.loginTagline}>Dunia lain menantimu</Text>
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Selamat Datang</Text>
              <Text style={styles.loginSubtitle}>
                Masuk untuk melanjutkan perjalananmu
              </Text>

              <Button button={styles.googleButton} onPress={handleGoogle}>
                <Image
                  source={require("@/assets/images/GoogleIcon.png")}
                  style={styles.googleIcon}
                  contentFit="cover"
                />
                <Text style={styles.googleText}>Lanjutkan dengan Google</Text>
              </Button>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.privacyNote}>
                Dengan masuk, kamu menyetujui{" "}
                <Text style={styles.privacyLink}>Kebijakan Privasi</Text> kami
              </Text>
            </View>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={goBackToOnboarding}
            >
              <Icon name="ChevronLeft" size={16} color={colors.textDark} />
              <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>
          </View>

          {loginLoading && (
            <View style={styles.loadingWrapper}>
              <Loader visible={loginLoading} />
            </View>
          )}
        </SafeAreaView>
      </Animated.View>

      <Toast {...toastState} onHide={hide} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flatList: { flex: 1 },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationBox: {
    width: 280,
    height: 280,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: colors.accent,
    elevation: 10,
    overflow: "hidden",
  },
  image: {
    width: "90%",
    height: "90%",
  },
  bottomPanel: {
    height: 300,
    paddingHorizontal: 28,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  textArea: {
    height: 110,
    marginBottom: 20,
  },
  textSlide: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 21,
    fontWeight: "400",
  },
  actionRow: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipText: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: "500",
  },
  arrowBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    overflow: "hidden",
  },
  startText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.background,
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 32,
  },
  loginBranding: {
    alignItems: "center",
    gap: 8,
  },
  loginLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 4,
  },
  loginAppName: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  loginTagline: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: "400",
    fontStyle: "italic",
  },
  loginCard: {
    backgroundColor: colors.secondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 20,
    fontWeight: "400",
  },
  googleButton: {
    width: "100%",
    height: 52,
    gap: 10,
    marginBottom: 0,
  },
  googleIcon: {
    width: 32,
    height: 32,
  },
  googleText: {
    color: "#2c2c2c",
    fontSize: 14,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: "500",
  },
  privacyNote: {
    fontSize: 12,
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 18,
  },
  privacyLink: {
    color: colors.accent,
    fontWeight: "600",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: "500",
  },
  loadingWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
