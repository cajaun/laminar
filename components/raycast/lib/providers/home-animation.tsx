import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from "react";
import { Dimensions, TextInput } from "react-native";
import { SharedValue, useSharedValue, withTiming } from "react-native-reanimated";

// raycast-home-search-transition-animation 🔽

export const SEARCHBAR_HEIGHT = 40;
export const EDIT_HOME_CONTAINER_WIDTH = 65;
export const SETTINGS_CONTAINER_WIDTH = 65;
export const CANCEL_CONTAINER_WIDTH = 75;
const LEFT_PADDING = 16;

export const SEARCHBAR_FAVORITES_WIDTH =
  Dimensions.get("window").width - EDIT_HOME_CONTAINER_WIDTH - SETTINGS_CONTAINER_WIDTH;
export const SEARCHBAR_COMMANDS_WIDTH =
  Dimensions.get("window").width - CANCEL_CONTAINER_WIDTH - LEFT_PADDING;

export const TRIGGER_DRAG_DISTANCE = -45;  // fade/blur begins here
export const FULL_DRAG_DISTANCE = -60;     // full opacity/blur reached here

type ScreenView = "favorites" | "commands";

type ContextValue = {
  inputRef: RefObject<TextInput>;
  screenView: SharedValue<ScreenView>;
  isListDragging: SharedValue<boolean>;
  offsetY: SharedValue<number>;
  blurIntensity: SharedValue<number>;
  onGoToCommands: () => void;
  onGoToFavorites: () => void;
};

const HomeAnimationContext = createContext<ContextValue>({} as ContextValue);

export const HomeAnimationProvider: FC<PropsWithChildren> = ({ children }) => {
  const inputRef = useRef<TextInput>(null);

  const screenView = useSharedValue<ScreenView>("favorites");
  const offsetY = useSharedValue(0);
  const isListDragging = useSharedValue(false);
  const blurIntensity = useSharedValue(0);

  const onGoToCommands = useCallback(() => {
    screenView.value = "commands";
    blurIntensity.value = withTiming(100);
    inputRef.current?.focus();
  }, []);

  const onGoToFavorites = useCallback(() => {
    screenView.value = "favorites";
    blurIntensity.value = withTiming(0);
    inputRef.current?.blur();
  }, []);

  const value = {
    inputRef,
    screenView,
    isListDragging,
    offsetY,
    blurIntensity,
    onGoToCommands,
    onGoToFavorites,
  };
  return <HomeAnimationContext.Provider value={value}>{children}</HomeAnimationContext.Provider>;
};

export const useHomeAnimation = () => {
  const context = useContext(HomeAnimationContext);

  if (!context) {
    throw new Error("useHomeAnimation must be used within an HomeAnimationProvider");
  }

  return context;
};

// raycast-home-search-transition-animation 🔼
