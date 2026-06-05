import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { SplashScreen, Stack } from "expo-router";
import { errorBus } from "@/services/api/utils/errorBus";
import MaintenanceScreen from "@/components/MaintenanceScreen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loaded] = useFonts({
    "Circular-Regular": require("@/assets/fonts/Circular-Regular.ttf"),
    "Circular-Medium": require("@/assets/fonts/Circular-Medium.ttf"),
    "Circular-SemiBold": require("@/assets/fonts/Circular-SemiBold.ttf"),
    "Circular-Bold": require("@/assets/fonts/Circular-Bold.ttf"),
    "Circular-ExtraBold": require("@/assets/fonts/Circular-ExtraBold.ttf"),
  });

  useEffect(() => {
    const unsubscribe = errorBus.subscribe((status) => {
      if (status === 502 || status >= 500) {
        setIsMaintenance(true);
      }
    });

    return () => unsubscribe();
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
