import { useColorScheme } from "react-native";

export type FluxTheme = {
  readonly isDark: boolean;
  readonly background: string;
  readonly section: string;
  readonly primary: string;
  readonly secondary: string;
  readonly divider: string;
  readonly headerHandle: string;
  readonly favorite: string;
  readonly icon: string;
  readonly selectedRange: string;
  readonly cursorSurface: string;
  readonly cursorGuide: string;
  readonly cursorBorder: string;
  readonly cursorOuter: string;
  readonly cursorInner: string;
  readonly chartLine: string;
  readonly chartFutureLine: string;
  readonly chartDivider: string;
};

const lightTheme: FluxTheme = {
  isDark: false,
  background: "#FFFFFF",
  section: "#F6F7F9",
  primary: "#111318",
  secondary: "#999999",
  divider: "#F0F0F0",
  headerHandle: "#E4E7EB",
  favorite: "#E1E4E8",
  icon: "#A3A3A3",
  selectedRange: "#D9D9D9",
  cursorSurface: "#F6F7F7",
  cursorGuide: "#F6F7F7",
  cursorBorder: "#F6F7F7",
  cursorOuter: "#FFFFFF",
  cursorInner: "#000000",
  chartLine: "#000000",
  chartFutureLine: "#F5F5F5",
  chartDivider: "#F1F1F1",
};

const darkTheme: FluxTheme = {
  isDark: true,
  background: "#000000",
  section: "#191919",
  primary: "#F5F5F5",
  secondary: "#98989D",
  divider: "#2C2C2E",
  headerHandle: "#3A3A3C",
  favorite: "#4A4A4C",
  icon: "#98989D",
  selectedRange: "#191919",
  cursorSurface: "#191919",
  cursorGuide: "#3A3A3C",
  cursorBorder: "#3A3A3C",
  cursorOuter: "#191919",
  cursorInner: "#F5F5F5",
  chartLine: "#F5F5F5",
  chartFutureLine: "#1A1A1A",
  chartDivider: "#2C2C2E",
};

export function useMorphingChartTheme() {
  return useColorScheme() === "dark" ? darkTheme : lightTheme;
}
