import { SharedValue, useSharedValue } from "react-native-reanimated";
import { ReanimatedScrollEvent } from "react-native-reanimated/lib/typescript/hook/commonTypes";

export type ScrollDirection = "to-top" | "to-bottom" | "idle";
export type ScrollDirectionValue = SharedValue<ScrollDirection>;

export const useScrollDirection = (param?: "include-negative") => {
  const scrollDirection = useSharedValue<ScrollDirection>("idle");
  const prevOffsetY = useSharedValue(0);
  const offsetYAnchorOnBeginDrag = useSharedValue(0);
  const offsetYAnchorOnChangeDirection = useSharedValue(0);

  // Place it inside the list animated scroll handler onBeginDrag
  const onBeginDrag = (e: ReanimatedScrollEvent) => {
    "worklet";
    offsetYAnchorOnBeginDrag.value = e.contentOffset.y;
  };

  // Place it inside the list animated scroll handler onScroll
  const onScroll = (e: ReanimatedScrollEvent) => {
    "worklet";

    const offsetY = e.contentOffset.y;

    const positiveOffsetY = param === "include-negative" ? offsetY : Math.max(offsetY, 0);
    const positivePrevOffsetY =
      param === "include-negative" ? prevOffsetY.value : Math.max(prevOffsetY.value, 0);

    if (
      positivePrevOffsetY - positiveOffsetY < 0 &&
      (scrollDirection.value === "idle" || scrollDirection.value === "to-top")
    ) {
      scrollDirection.value = "to-bottom";
      offsetYAnchorOnChangeDirection.value = offsetY;
    }
    if (
      positivePrevOffsetY - positiveOffsetY > 0 &&
      (scrollDirection.value === "idle" || scrollDirection.value === "to-bottom")
    ) {
      scrollDirection.value = "to-top";
      offsetYAnchorOnChangeDirection.value = offsetY;
    }

    prevOffsetY.value = offsetY;
  };

  return {
    scrollDirection,
    offsetYAnchorOnBeginDrag,
    offsetYAnchorOnChangeDirection,
    onBeginDrag,
    onScroll,
  };
};
