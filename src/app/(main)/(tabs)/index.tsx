import { BlurTargetView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useRef, useState, useCallback } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

import colors from "@/constants/colors";
import Navbar from "@/components/Navbar";

import ListScreen from "./ListScreen";
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import LibraryScreen from "./LibraryScreen";

const TOTAL_TABS = 4;
const SWIPE_THRESHOLD = 60;

function FadeTab({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const prevActive = useRef(isActive);

  if (prevActive.current !== isActive) {
    prevActive.current = isActive;
    Animated.timing(opacity, {
      toValue: isActive ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View
      style={[
        styles.contentArea,
        { opacity },
        !isActive && StyleSheet.absoluteFillObject,
        !isActive && ({ pointerEvents: "none" } as any),
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabParams, setTabParams] = useState<any>(null);
  const blurTargetRef = useRef<View | null>(null);

  const handleSelectTab = useCallback((index: number, params?: any) => {
    setActiveTab(index);
    if (params) setTabParams(params);
    else setTabParams(null);
  }, []);

  const onGestureEvent = useCallback(
    ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
      const { translationX, velocityX, state } = nativeEvent;

      if (state !== 5) return;

      const isSwipeLeft = translationX < -SWIPE_THRESHOLD || velocityX < -500;
      const isSwipeRight = translationX > SWIPE_THRESHOLD || velocityX > 500;

      if (isSwipeLeft && activeTab < TOTAL_TABS - 1) {
        handleSelectTab(activeTab + 1);
      } else if (isSwipeRight && activeTab > 0) {
        handleSelectTab(activeTab - 1);
      }
    },
    [activeTab, handleSelectTab],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeAreaView} edges={["top"]}>
          <StatusBar style="light" />
          <View style={styles.container}>
            <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
              <PanGestureHandler
                onHandlerStateChange={onGestureEvent}
                activeOffsetX={[-25, 25]}
                failOffsetY={[-10, 10]}
              >
                <View style={{ flex: 1 }}>
                  <FadeTab isActive={activeTab === 0}>
                    <HomeScreen
                      onNavigateToList={(type) =>
                        handleSelectTab(1, { initialType: type })
                      }
                    />
                  </FadeTab>
                  <FadeTab isActive={activeTab === 1}>
                    <ListScreen initialParams={tabParams} />
                  </FadeTab>
                  <FadeTab isActive={activeTab === 2}>
                    <LibraryScreen />
                  </FadeTab>
                  <FadeTab isActive={activeTab === 3}>
                    <ProfileScreen />
                  </FadeTab>
                </View>
              </PanGestureHandler>
            </BlurTargetView>

            <Navbar
              selectedIndex={activeTab}
              onSelect={(index) => handleSelectTab(index)}
              blurTargetRef={blurTargetRef}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  blurTarget: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
});
