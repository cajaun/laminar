import { useCallback } from "react";
import {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { numberTickerSliderValues } from "@/components/morph-demo/demo-data";
import { useNumberTickerSliderDemoStore } from "@/components/morph-demo/use-demo-state";

export function useNumberTickerSlider() {
  const initialIndex = numberTickerSliderValues.length - 1;
  const store = useNumberTickerSliderDemoStore(initialIndex);
  const progress = useSharedValue(1);
  const sliderIndex = useDerivedValue(() =>
    Math.round(
      clamp(progress.get(), 0, 1) * (numberTickerSliderValues.length - 1),
    ),
  );
  // even values mark the last index sent to js and odd values mark a pending update
  const bridgeState = useSharedValue(initialIndex * 2);
  const publishLatestIndex = useCallback(() => {
    // read the current shared index when js handles the message to avoid stale frames
    const latestIndex = sliderIndex.get();
    store.setIndex(latestIndex);
    bridgeState.set(latestIndex * 2);
  }, [bridgeState, sliderIndex, store]);

  useAnimatedReaction(
    () => {
      const valueCount = numberTickerSliderValues.length;
      const index = sliderIndex.get();
      const publishedState = bridgeState.get();

      // combine target and bridge state so the reaction skips unchanged ui frames
      return index * valueCount * 2 + publishedState;
    },
    (state) => {
      const valueCount = numberTickerSliderValues.length;
      const publishedState = state % (valueCount * 2);
      const publishedIndex = Math.floor(publishedState / 2);
      const pending = publishedState % 2 === 1;
      const index = Math.floor(state / (valueCount * 2));

      if (pending || index === publishedIndex) {
        return;
      }

      bridgeState.set(publishedIndex * 2 + 1);
      runOnJS(publishLatestIndex)();
    },
    [bridgeState, publishLatestIndex, sliderIndex],
  );

  return { progress, store };
}
