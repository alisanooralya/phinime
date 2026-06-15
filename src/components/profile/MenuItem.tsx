import { TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  secret?: boolean;
}

export default function MenuItem({
  icon,
  label,
  onPress,
  danger,
  secret,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          danger && styles.menuIconDanger,
          secret && styles.menuIconSecret,
        ]}
      >
        <Icon
          name={icon as any}
          size={18}
          color={secret ? "#FFD700" : danger ? "#F87171" : colors.text}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          danger && styles.menuLabelDanger,
          secret && styles.menuLabelSecret,
        ]}
      >
        {label}
      </Text>
      <Icon
        name="ChevronRight"
        size={14}
        color={secret ? "#FFD700" : danger ? "#F87171" : colors.textDark}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: {
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  menuIconSecret: {
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  menuLabelDanger: {
    color: "#F87171",
  },
  menuLabelSecret: {
    color: "#FFD700",
  },
});
