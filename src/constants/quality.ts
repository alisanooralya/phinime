import colors from "@/constants/colors";

type QualityOption = {
  id: string;
  label: string;
  badge?: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
};

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: "480p",
    label: "480p",
    badge: "Hemat Data",
    description:
      "Kualitas standar. Cocok untuk koneksi lambat atau menghemat kuota internet.",
    icon: "Wifi",
    iconColor: "#60A5FA",
    iconBg: "rgba(96, 165, 250, 0.12)",
  },
  {
    id: "720p",
    label: "720p",
    badge: "Disarankan",
    description:
      "Kualitas HD yang seimbang antara kejernihan gambar dan penggunaan data.",
    icon: "Monitor",
    iconColor: "#34D399",
    iconBg: "rgba(52, 211, 153, 0.12)",
  },
  {
    id: "1080p",
    label: "1080p",
    badge: "Full HD",
    description:
      "Kualitas terbaik. Butuh koneksi stabil dan perangkat yang mendukung resolusi tinggi.",
    icon: "Tv",
    iconColor: colors.accent,
    iconBg: "rgba(245, 160, 212, 0.12)",
  },
  {
    id: "manual",
    label: "Manual",
    description:
      "Pilih kualitas secara langsung di setiap video sebelum diputar.",
    icon: "SlidersHorizontal",
    iconColor: "#FBBF24",
    iconBg: "rgba(251, 191, 36, 0.12)",
  },
];

export type { QualityOption };
export { QUALITY_OPTIONS };
