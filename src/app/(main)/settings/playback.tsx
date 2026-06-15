import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import SettingToggleRow from "@/components/profile/SettingToggleRow";

const STORAGE_KEYS = {
  AUTOPLAY: "@phinime:autoplay",
  PIP: "@phinime:pip",
};

export default function PlaybackSettingScreen() {
  const router = useRouter();

  const [autoplay, setAutoplay] = useState(true);
  const [pip, setPip] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [storedAutoplay, storedPip] = await AsyncStorage.multiGet([
          STORAGE_KEYS.AUTOPLAY,
          STORAGE_KEYS.PIP,
        ]);
        if (storedAutoplay[1] !== null)
          setAutoplay(storedAutoplay[1] === "true");
        if (storedPip[1] !== null) setPip(storedPip[1] === "true");
      } catch (e) {
        console.warn("[Pemutaran] Gagal muat pengaturan:", e);
      }
    }
    loadSettings();
  }, []);

  const handleAutoplay = async (val: boolean) => {
    setAutoplay(val);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTOPLAY, String(val));
  };

  const handlePip = async (val: boolean) => {
    setPip(val);
    await AsyncStorage.setItem(STORAGE_KEYS.PIP, String(val));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton title="Pemutaran" />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIconWrap}>
          <Icon name="Play" size={28} color={colors.accent} />
        </View>
        <Text style={styles.bannerTitle}>Pengaturan Pemutaran</Text>
        <Text style={styles.bannerDesc}>
          Sesuaikan cara video diputar di aplikasi ini. Pengaturan disimpan
          secara lokal di perangkat kamu.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KELANJUTAN OTOMATIS</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="SkipForward"
            iconColor={colors.accent}
            iconBg="rgba(245, 160, 212, 0.12)"
            label="Autoplay"
            description="Lanjutkan ke episode berikutnya secara otomatis setelah episode selesai diputar."
            value={autoplay}
            onValueChange={handleAutoplay}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MODE MENGAPUNG</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="PictureInPicture2"
            iconColor="#60A5FA"
            iconBg="rgba(96, 165, 250, 0.12)"
            label="Picture in Picture"
            description="Biarkan video tetap muncul dalam jendela kecil mengapung saat kamu membuka aplikasi lain."
            value={pip}
            onValueChange={handlePip}
          />
        </View>
      </View>

      <View style={[styles.section, styles.infoBox]}>
        <View style={styles.infoRow}>
          <Icon name="Info" size={14} color={colors.textDark} />
          <Text style={styles.infoText}>
            Fitur Picture in Picture membutuhkan dukungan dari sistem operasi
            perangkat Android 8+.
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
    color: colors.textDark,
    lineHeight: 18,
  },
});
