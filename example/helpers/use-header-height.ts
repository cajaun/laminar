import { useHeaderHeight as useNavigationHeaderHeight } from "expo-router/react-navigation";
import { useRef } from "react";

export function useHeaderHeight() {
  const headerHeight = useNavigationHeaderHeight();
  const fixedHeight = useRef(headerHeight);

  return fixedHeight.current;
}
