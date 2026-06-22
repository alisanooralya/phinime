import { useFonts } from "expo-font";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect, useState, useRef } from "react";
import { useRouter, SplashScreen, Stack } from "expo-router";

import { errorBus } from "@/services/api/utils/errorBus";
import MaintenanceScreen from "@/components/MaintenanceScreen";

SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("episode_alerts_v1", {
    name: "Update Episode",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export default function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loaded] = useFonts({
    "Circular-Regular": require("@/assets/fonts/Circular-Regular.ttf"),
    "Circular-Medium": require("@/assets/fonts/Circular-Medium.ttf"),
    "Circular-SemiBold": require("@/assets/fonts/Circular-SemiBold.ttf"),
    "Circular-Bold": require("@/assets/fonts/Circular-Bold.ttf"),
    "Circular-ExtraBold": require("@/assets/fonts/Circular-ExtraBold.ttf"),
  });

  const router = useRouter();
  const responseListener = useRef<any>();

  useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notifikasi diklik:", response);
        const slug = response.notification.request.content.data?.slug;
        if (slug) {
          router.push(`/watch/${slug}`);
        }
      });
    return () => responseListener.current?.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = errorBus.subscribe((status) => {
      if (status === 502 || status >= 500) {
        setIsMaintenance(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  if (isMaintenance) {
    return <MaintenanceScreen onRetry={() => setIsMaintenance(false)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
