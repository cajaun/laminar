import { useHeaderHeight as useNavigationHeaderHeight } from "expo-router/react-navigation";
import { useRef } from "react";
import { Platform } from "react-native";

export function useHeaderHeight() {
  const headerHeight = useNavigationHeaderHeight();
  const fixedHeight = useRef(headerHeight);

  return Platform.OS === "android" ? fixedHeight.current : headerHeight;
}
