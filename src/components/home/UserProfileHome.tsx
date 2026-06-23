import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import Text from "../Text";
import ExpCard from "../ExpCard";
import { AlertDialog } from "../Alert";

import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useAlertDialog } from "@/hooks/useAlert";

type UserData = {
  name: string;
  avatar: string;
  email: string;
};

export default function UserProfileHome() {
  const [user, setUser] = useState<UserData | null>(null);
  const { state: alertState, hide: hideAlert } = useAlertDialog();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser({
        name:
          user.user_metadata?.custom_name ??
          user.user_metadata?.full_name ??
          "User",
        avatar:
          user.user_metadata?.custom_avatar_url ??
          user.user_metadata?.avatar_url ??
          "",
        email: user.email ?? "",
      });
    });
  }, []);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.left}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.greeting}>👋 Halo, {user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      </View>

      <ExpCard variant="compact" />
      <AlertDialog {...alertState} onDismiss={hideAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    marginHorizontal: 16,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  greeting: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  email: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
