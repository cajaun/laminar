import { runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ReanimatedScrollEvent } from "react-native-reanimated/lib/typescript/hook/commonTypes";
import { ScrollDirectionValue } from "./use-scroll-direction";

type Params = {
  isListDragging: SharedValue<boolean>;
  scrollDirection: ScrollDirectionValue;
  triggerOffset: number;
};

/**
 * Hook for haptic on scroll: fires once when passing a trigger distance in both directions.
 * Use this when you want one haptic feedback per threshold crossing.
 */
export const useHapticOnScroll = ({ isListDragging, scrollDirection, triggerOffset }: Params) => {
  const isHapticTriggered = useSharedValue(false);

  const handleHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isHapticTriggered.value = true;
  };

  useAnimatedReaction(
    () => scrollDirection.value,
    () => {
      if (!isListDragging.value) {
        return;
      }
      isHapticTriggered.value = false;
    }
  );

  const singleHapticOnScroll = (event: ReanimatedScrollEvent) => {
    "worklet";

    if (!isListDragging.value) {
      return;
    }

    const offsetY = event.contentOffset.y;

    if (Math.sign(offsetY) !== Math.sign(triggerOffset)) {
      return;
    }

    if (scrollDirection.value === "to-bottom") {
      if (offsetY > triggerOffset && !isHapticTriggered.value) {
        runOnJS(handleHaptics)();
      }
    } else if (scrollDirection.value === "to-top") {
      if (offsetY < triggerOffset && !isHapticTriggered.value) {
        runOnJS(handleHaptics)();
      }
    }
  };

  return { singleHapticOnScroll };
};
