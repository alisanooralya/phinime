import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, BackHandler, Image } from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import Button from "./Button";
import colors from "@/constants/colors";

interface MaintenanceScreenProps {
  onRetry: () => void;
}

export default function MaintenanceScreen({ onRetry }: MaintenanceScreenProps) {
  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Icon name="ServerCrash" size={80} color={colors.text} />
        </View>

        <Text style={styles.title}>Server Maintenance</Text>
        <Text style={styles.subtitle}>
          Dunia simulasi ini sedang beristirahat dalam keheningan yang tenang.
          Istirahatlah sejenak, kekasihku, dan kembalilah saat takdir telah
          bersiap.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Coba Lagi"
            onPress={onRetry}
            button={styles.retryBtn}
          />
          <Button
            title="Keluar Aplikasi"
            onPress={handleExit}
            button={styles.exitBtn}
            text={styles.exitText}
          />
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 10,
  },
  iconWrapper: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
    backgroundColor: colors.accentDark,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  retryBtn: {
    backgroundColor: colors.accent,
    height: 50,
  },
  exitBtn: {
    backgroundColor: "transparent",
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  exitText: {
    color: colors.textDark,
  },
});
