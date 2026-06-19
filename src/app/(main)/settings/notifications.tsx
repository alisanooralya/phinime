import { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import SettingToggleRow from "@/components/profile/SettingToggleRow";

const STORAGE_KEYS = {
  BOOKMARKS: "@phinime:notif_bookmarks",
  RELEASES: "@phinime:notif_releases",
};

export default function NotificationSettingScreen() {
  const [notifBookmarks, setNotifBookmarks] = useState(true);
  const [notifReleases, setNotifReleases] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [storedBookmarks, storedReleases] = await AsyncStorage.multiGet([
          STORAGE_KEYS.BOOKMARKS,
          STORAGE_KEYS.RELEASES,
        ]);
        if (storedBookmarks[1] !== null)
          setNotifBookmarks(storedBookmarks[1] === "true");
        if (storedReleases[1] !== null)
          setNotifReleases(storedReleases[1] === "true");
      } catch (e) {
        console.warn("[Notifikasi] Gagal muat pengaturan:", e);
      }
    }
    loadSettings();
  }, []);

  const handleNotifBookmarks = async (val: boolean) => {
    setNotifBookmarks(val);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, String(val));
    if (val) {
      await requestPermissions();
    }
  };

  const handleNotifReleases = async (val: boolean) => {
    setNotifReleases(val);
    await AsyncStorage.setItem(STORAGE_KEYS.RELEASES, String(val));
    if (val) {
      await requestPermissions();
    }
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

  const scheduleTestNotification = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Phinime Test Notification 🔔",
        body: "Yeay! Notifikasi berhasil dikonfigurasi dengan benar.",
        data: { data: "test data" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    Alert.alert("Berhasil", "Notifikasi akan muncul dalam 2 detik.");
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
            value={notifBookmarks}
            onValueChange={handleNotifBookmarks}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UPDATE HARIAN</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="Calendar"
            iconColor="#60A5FA"
            iconBg="rgba(96, 165, 250, 0.12)"
            label="Rilis Hari Ini"
            description="Terima ringkasan daftar anime yang akan tayang setiap harinya."
            value={notifReleases}
            onValueChange={handleNotifReleases}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PENGUJIAN</Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={scheduleTestNotification}
          activeOpacity={0.8}
        >
          <Icon name="Send" size={20} color={colors.text} />
          <Text style={styles.testButtonText}>Kirim Notifikasi Tes</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, styles.infoBox]}>
        <View style={styles.infoRow}>
          <Icon name="Info" size={14} color={colors.textDark} />
          <Text style={styles.infoText}>
            Pastikan izin notifikasi untuk aplikasi Phinime telah aktif di
            pengaturan sistem perangkat kamu.
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
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
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
