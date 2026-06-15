import { View, StyleSheet } from "react-native";
import Text from "@/components/Text";
import colors from "@/constants/colors";

interface StatCardProps {
  value: number;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.accent,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textDark,
    marginTop: 3,
    fontWeight: "500",
  },
});
