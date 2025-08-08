import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SEARCHBAR_HEIGHT } from "../providers/home-animation";

// raycast-home-search-transition-animation 🔽

export const useHeaderHeight = () => {
  const insets = useSafeAreaInsets();

  return {
    netHeight: SEARCHBAR_HEIGHT,
    grossHeight: insets.top + 58,
    insetTop: insets.top + 8,
  };
};

// raycast-home-search-transition-animation 🔼
