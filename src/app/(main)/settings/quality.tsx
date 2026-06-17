import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Animated, TouchableOpacity, StyleSheet, View } from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { QUALITY_OPTIONS, type QualityOption } from "@/constants/quality";

const STORAGE_KEY = "@phinime:video_quality";

function QualityOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: QualityOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const dotScale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(dotScale, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [selected]);

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <View style={styles.optionCard}>
        <View style={styles.optionInner}>
          <View style={[styles.optionIcon, { backgroundColor: option.iconBg }]}>
            <Icon
              name={option.icon as any}
              size={22}
              color={option.iconColor}
            />
          </View>

          <View style={styles.optionBody}>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDesc}>{option.description}</Text>
          </View>

          <View style={[styles.radio, selected && styles.radioSelected]}>
            <Animated.View
              style={[styles.radioDot, { transform: [{ scale: dotScale }] }]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function QualitySettingScreen() {
  const [selected, setSelected] = useState<string>("480p");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setSelected(val);
    });
  }, []);

  const handleSelect = async (id: string) => {
    setSelected(id);
    await AsyncStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton title="Kualitas Video" />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIconWrap}>
          <Icon name="Gauge" size={28} color={colors.accent} />
        </View>
        <Text style={styles.bannerTitle}>Pengaturan Kualitas</Text>
        <Text style={styles.bannerDesc}>
          Tentukan kualitas video default saat menonton anime. Pengaturan ini
          berlaku untuk semua episode secara otomatis.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PILIH KUALITAS DEFAULT</Text>
        <View style={styles.optionList}>
          {QUALITY_OPTIONS.map((opt, idx) => (
            <QualityOptionRow
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              onSelect={() => handleSelect(opt.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Icon name="Info" size={14} color={colors.textDark} />
          <Text style={styles.infoText}>
            Kualitas yang dipilih akan disimpan secara lokal di perangkat kamu.
            Mode Manual memungkinkan kamu memilih kualitas secara langsung di
            setiap video.
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
    marginBottom: 24,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.08)",
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
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  optionList: {
    gap: 8,
  },
  optionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    backgroundColor: colors.secondary,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 14,
    color: colors.text,
  },
  optionDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textDark,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 18,
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
