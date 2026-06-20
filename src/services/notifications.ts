import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export async function registerPushToken(
  userId: string,
): Promise<string | null> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Push] Permission ditolak user.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      require("expo-constants").default?.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResponse.data;

    if (!token) {
      console.log("[Push] Gagal mendapatkan token.");
      return null;
    }

    const { error } = await supabase
      .from("push_tokens")
      .upsert(
        { user_id: userId, token },
        { onConflict: "user_id,token", ignoreDuplicates: true },
      );

    if (error) {
      console.warn("[Push] Gagal simpan token ke Supabase:", error);
      return null;
    }

    console.log("[Push] Token tersimpan:", token);
    return token;
  } catch (e) {
    console.warn("[Push] Error saat register token:", e);
    return null;
  }
}

export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    const projectId =
      require("expo-constants").default?.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResponse.data;

    if (!token) return;

    const { error } = await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("token", token);

    if (error) {
      console.warn("[Push] Gagal hapus token:", error);
    }
  } catch (e) {
    console.warn("[Push] Error saat unregister token:", e);
  }
}
