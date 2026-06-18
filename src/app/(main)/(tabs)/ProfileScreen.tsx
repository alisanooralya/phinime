import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import ExpCard from "@/components/ExpCard";
import StatCard from "@/components/profile/StatCard";
import MenuItem from "@/components/profile/MenuItem";
import RankAvatarBorder from "@/components/RankAvatarBorder";

import { supabase } from "@/lib/supabase";
import { getBookmarks } from "@/services/bookmark";
import { getWatchHistory } from "@/services/history";
import { getUserExp, UserExp } from "@/services/exp";
import { AlertDialog, Toast } from "@/components/Alert";
import { useAlertDialog, useToast } from "@/hooks/useAlert";

interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Stats {
  watched: number;
  bookmarks: number;
  completed: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileScreen({ isActive }: { isActive?: boolean }) {
  const router = useRouter();
  const scroll = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [expData, setExpData] = useState<UserExp | null>(null);
  const [stats, setStats] = useState<Stats>({
    watched: 0,
    bookmarks: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [easterEggCount, setEasterEggCount] = useState(0);

  const {
    state: alertState,
    confirm,
    show: showDialog,
    hide: hideAlert,
  } = useAlertDialog();
  const {
    state: toastState,
    info: toastInfo,
    error: toastError,
    hide: hideToast,
  } = useToast();

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, []),
  );

  useEffect(() => {
    if (isActive) {
      fetchAll();
    }
  }, [isActive]);

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id;
      if (!uid) return;

      const channel = supabase
        .channel("profile-exp-realtime")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_exp",
            filter: `user_id=eq.${uid}`,
          },
          (payload) => {
            setExpData(payload.new as UserExp);
          },
        )
        .subscribe();

      return channel;
    };

    let channelRef: any;
    setupRealtime().then((ch) => {
      channelRef = ch;
    });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, []);

  async function fetchAll() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      const uid = user.id;
      const email = user.email ?? "";
      const name =
        user.user_metadata?.custom_name ??
        user.user_metadata?.full_name ??
        email.split("@")[0];
      const avatarUrl =
        user.user_metadata?.custom_avatar_url ??
        user.user_metadata?.avatar_url ??
        null;

      setProfile({ name, email, avatarUrl });

      const [history, bookmarkList, exp] = await Promise.all([
        getWatchHistory(uid, 1000),
        getBookmarks(uid),
        getUserExp(uid),
      ]);

      const completed = history.filter(
        (h) => h.duration_ms > 0 && h.progress_ms / h.duration_ms >= 0.8,
      ).length;

      setExpData(exp);
      setStats({
        watched: history.length,
        bookmarks: bookmarkList.length,
        completed,
      });
    } catch (err) {
      console.error("[Profile] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showDialog({
        title: "Izin diperlukan",
        message: "Izinkan akses galeri untuk mengganti foto profil.",
        confirmText: "Siap",
        onConfirm: hideAlert,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setAvatarLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id;
      if (!uid) return;

      const ext = uri.split(".").pop() ?? "jpg";
      const timestamp = Date.now();
      const path = `avatars/${uid}_${timestamp}.${ext}`;

      const oldUrl = profile?.avatarUrl;
      if (oldUrl && oldUrl.includes("avatars/")) {
        const parts = oldUrl.split("avatars/");
        if (parts.length > 1) {
          const oldPath = `avatars/${parts[1].split("?")[0]}`;
          supabase.storage
            .from("profiles")
            .remove([oldPath])
            .catch((err) => {
              console.warn("[Profile] Gagal hapus avatar lama:", err);
            });
        }
      }

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const normalizedExt = ext === "jpg" ? "jpeg" : ext;
      const contentType = `image/${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, buffer, { upsert: true, contentType });

      if (uploadError) {
        console.error("[Profile] uploadError:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          custom_avatar_url: publicUrl,
        },
      });

      setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : prev));
    } catch (err) {
      console.error("[Profile] Gagal upload avatar:", err);
      toastError("Gagal", "Tidak dapat mengganti foto profil. Coba lagi.");
    } finally {
      setAvatarLoading(false);
    }
  }, [showDialog, hideAlert, toastError]);

  const handleSignOut = useCallback(() => {
    confirm(
      "Keluar",
      "Yakin ingin keluar?",
      async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/onboarding");
      },
      { variant: "error", confirmText: "Keluar" },
    );
  }, [router, confirm]);

  const handleDeleteAccount = useCallback(() => {
    confirm(
      "Hapus Akun",
      "Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh riwayat dan data Anda akan hilang selamanya.",
      async () => {
        showDialog({
          variant: "error",
          title: "Hapus Akun Gagal",
          message:
            "Menghapus akun saat ini tidak dapat dilakukan dari aplikasi karena kebijakan keamanan. Silakan hubungi admin.",
          confirmText: "Tutup",
          onConfirm: hideAlert,
        });
      },
      { variant: "error", confirmText: "Hapus Permanen" },
    );
  }, [confirm, showDialog, hideAlert]);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <Loader visible={loading} />
      </View>
    );
  }

  const initials = getInitials(profile?.name ?? "?");

  return (
    <View style={styles.container}>
      <Header title="profile" scroll={scroll} />
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scroll } } }],
          { useNativeDriver: false },
        )}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            disabled={avatarLoading}
            style={styles.avatarContainer}
          >
            <RankAvatarBorder
              rank={(expData?.rank as 1 | 2 | 3 | 4) ?? 1}
              avatarUrl={profile?.avatarUrl ?? null}
              initials={initials}
              size={100}
            />
            <View style={styles.avatarEditBadge}>
              {avatarLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="Camera" size={12} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={stats.watched} label="Ditonton" />
          <View style={styles.statDivider} />
          <StatCard value={stats.bookmarks} label="Bookmark" />
          <View style={styles.statDivider} />
          <StatCard value={stats.completed} label="Selesai" />
        </View>

        <ExpCard variant="full" />
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>PENGATURAN</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="Play"
              label="Pemutaran"
              onPress={() => router.push("/(main)/settings/playback")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="Monitor"
              label="Kualitas"
              onPress={() => router.push("/(main)/settings/quality")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="Bell"
              label="Notifikasi"
              onPress={() => router.push("/(main)/settings/notifications")}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, styles.dangerSectionTitle]}>
            ZONA BERBAHAYA
          </Text>
          <View style={[styles.menuCard, styles.dangerMenuCard]}>
            <MenuItem
              icon="LogOut"
              label="Keluar"
              onPress={handleSignOut}
              danger
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="UserX"
              label="Hapus Akun"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        <View style={styles.padding} />
      </Animated.ScrollView>

      <AlertDialog {...alertState} onDismiss={hideAlert} />
      <Toast {...toastState} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  email: {
    fontSize: 13,
    color: colors.textDark,
    marginTop: 4,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  statDivider: {
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 6,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 14,
  },
  padding: {
    marginBottom: "24%",
  },
  dangerSectionTitle: {
    color: "#F87171",
  },
  dangerMenuCard: {
    borderColor: "rgba(248, 113, 113, 0.15)",
    borderWidth: 1,
  },
});
