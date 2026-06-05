import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Text from "./Text";
import Icon from "./Icon";
import colors from "@/constants/colors";

interface AnimeBatchProps {
  title: string;
  batchId: string;
}

export default function AnimeBatch({ title, batchId }: AnimeBatchProps) {
  const handleDownload = () => {
    // Navigate or trigger download logic
    console.log("Download batch:", batchId);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={handleDownload}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(74, 222, 128, 0.12)", "rgba(74, 222, 128, 0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.iconBox}>
        <Icon name="Download" size={20} color="#4ADE80" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>Download Full Pack Anime</Text>
      </View>

      <Icon name="ArrowRight" size={18} color="rgba(74, 222, 128, 0.4)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    overflow: "hidden",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(74, 222, 128, 0.8)",
  },
});
