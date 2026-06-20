import { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import SettingToggleRow from "@/components/profile/SettingToggleRow";

const STORAGE_KEYS = {
  BOOKMARK: "@phinime:notif_bookmark",
  GLOBAL: "@phinime:notif_global",
};

export default function NotificationSettingScreen() {
  const [notifBookmark, setNotifBookmark] = useState(true);
  const [notifGlobal, setNotifGlobal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [storedBookmark, storedGlobal] = await AsyncStorage.multiGet([
          STORAGE_KEYS.BOOKMARK,
          STORAGE_KEYS.GLOBAL,
        ]);
        if (storedBookmark[1] !== null) {
          setNotifBookmark(storedBookmark[1] === "true");
        }
        if (storedGlobal[1] !== null) {
          setNotifGlobal(storedGlobal[1] === "true");
        }
      } catch (e) {
        console.warn("[Notifikasi] Gagal muat pengaturan:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const syncToServer = async (
    key: "notif_bookmark" | "notif_global",
    value: boolean,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        [key]: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) throw error;
  };

  const requestPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert(
        "Izin Ditolak",
        "Kamu perlu mengizinkan notifikasi untuk mendapatkan update anime.",
      );
      return false;
    }
    return true;
  };

  const handleNotifBookmark = async (val: boolean) => {
    if (val) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setNotifBookmark(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARK, String(val));
      await syncToServer("notif_bookmark", val);
    } catch (e) {
      console.warn("[Notifikasi] Gagal simpan notif_bookmark:", e);
      setNotifBookmark(!val);
      Alert.alert("Gagal", "Tidak bisa menyimpan pengaturan, coba lagi.");
    }
  };

  const handleNotifGlobal = async (val: boolean) => {
    if (val) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setNotifGlobal(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL, String(val));
      await syncToServer("notif_global", val);
    } catch (e) {
      console.warn("[Notifikasi] Gagal simpan notif_global:", e);
      setNotifGlobal(!val);
      Alert.alert("Gagal", "Tidak bisa menyimpan pengaturan, coba lagi.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton title="Notifikasi" />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIconWrap}>
          <Icon name="Bell" size={28} color={colors.accent} />
        </View>
        <Text style={styles.bannerTitle}>Pengaturan Notifikasi</Text>
        <Text style={styles.bannerDesc}>
          Kelola bagaimana kamu menerima pemberitahuan dari Phinime tentang
          anime favoritmu.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ANIME FAVORIT</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="Bookmark"
            iconColor={colors.accent}
            iconBg="rgba(245, 160, 212, 0.12)"
            label="Anime Bookmark"
            description="Dapatkan notifikasi saat ada episode baru untuk anime yang kamu bookmark."
            value={notifBookmark}
            onValueChange={handleNotifBookmark}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UPDATE GLOBAL</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="Calendar"
            iconColor="#60A5FA"
            iconBg="rgba(96, 165, 250, 0.12)"
            label="Semua Anime Update"
            description="Dapatkan notifikasi untuk semua anime yang baru update episode, walau belum kamu bookmark."
            value={notifGlobal}
            onValueChange={handleNotifGlobal}
            disabled={loading}
          />
        </View>
      </View>

      <View style={[styles.section, styles.infoBox]}>
        <View style={styles.infoRow}>
          <Icon name="Info" size={14} color={colors.textDark} />
          <Text style={styles.infoText}>
            Notifikasi dikirim dari server saat episode baru tersedia. Pastikan
            izin notifikasi untuk aplikasi Phinime telah aktif di pengaturan
            sistem perangkat kamu.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245,160,212,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  bannerDesc: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 19,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  infoBox: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
    lineHeight: 18,
  },
});
