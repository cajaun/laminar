import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  useContext,
  useRef,
} from "react";
import { Dimensions, TextInput } from "react-native";
import { SharedValue, useSharedValue, withTiming } from "react-native-reanimated";

export const SEARCHBAR_HEIGHT = 35;
export const CANCEL_CONTAINER_WIDTH = 75;
const LEFT_PADDING = 16;
const COMPACT_SIDE_BUTTONS_WIDTH = 130; 

export const SEARCHBAR_END_WIDTH =
  Dimensions.get("window").width - COMPACT_SIDE_BUTTONS_WIDTH;

export const SEARCHBAR_INITIAL_WIDTH =
  Dimensions.get("window").width - CANCEL_CONTAINER_WIDTH - LEFT_PADDING;

type ContextValue = {
  inputRef: RefObject<TextInput>;
  searchbarWidth: SharedValue<number>;
};

const AnimationContext = createContext<ContextValue>({} as ContextValue);

export const AnimationProvider: FC<PropsWithChildren> = ({ children }) => {
  const inputRef = useRef<TextInput>(null);
const searchbarWidth = useSharedValue(SEARCHBAR_INITIAL_WIDTH);

  return (
    <AnimationContext.Provider value={{ inputRef, searchbarWidth }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useHomeAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useHomeAnimation must be used within a HomeAnimationProvider");
  }
  return context;
};
