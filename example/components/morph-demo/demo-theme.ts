import { useColorScheme } from "react-native";

export type DemoTheme = {
  readonly isDark: boolean;
  readonly background: string;
  readonly surface: string;
  readonly panel: string;
  readonly catalogPanel: string;
  readonly primary: string;
  readonly inverse: string;
  readonly secondary: string;
  readonly tertiary: string;
  readonly border: string;
  readonly teachingSurface: string;
  readonly slotSurface: string;
  readonly slotHighlight: string;
  readonly accent: string;
  readonly accentForeground: string;
  readonly buttonSurface: string;
  readonly buttonSurfaceForeground: string;
  readonly shadow: string;
  readonly actionSurface: string;
  readonly actionForeground: string;
};

const lightTheme: DemoTheme = {
  isDark: false,
  background: "#FFFFFF",
  surface: "#FFFFFF",
  panel: "#F8F8F8",
  catalogPanel: "#F7F7F7",
  primary: "#000000",
  inverse: "#FFFFFF",
  secondary: "#989898",
  tertiary: "#989898",
  border: "#D1D1D6",
  teachingSurface: "#F7FBFF",
  slotSurface: "#FFFFFF",
  slotHighlight: "#EAF4FF",
  accent: "#007AFF",
  accentForeground: "#FFFFFF",
  buttonSurface: "#F5F5F5",
  buttonSurfaceForeground: "#252525",
  shadow: "#8E8E93",
  actionSurface: "#000000",
  actionForeground: "#FFFFFF",
};

const darkTheme: DemoTheme = {
  isDark: true,
  background: "#000000",
  surface: "#1C1C1E",
  panel: "#1C1C1E",
  catalogPanel: "#1C1C1E",
  primary: "#F5F5F5",
  inverse: "#000000",
  secondary: "#98989D",
  tertiary: "#98989D",
  border: "#3A3D44",
  teachingSurface: "#17212D",
  slotSurface: "#1C1D21",
  slotHighlight: "#243B52",
  accent: "#007AFF",
  accentForeground: "#FFFFFF",
  buttonSurface: "#2C2C2E",
  buttonSurfaceForeground: "#F5F5F5",
  shadow: "#000000",
  actionSurface: "#F5F5F5",
  actionForeground: "#000000",
};

export function useDemoTheme() {
  return useColorScheme() === "dark" ? darkTheme : lightTheme;
}
