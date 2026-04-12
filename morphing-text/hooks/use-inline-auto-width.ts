import { useCallback, useEffect, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
};

export const useInlineAutoWidth = ({ enabled, driveToWidth }: Params) => {
  const widthValue = useSharedValue(0);
  const [observedWidth, setObservedWidth] = useState<number | null>(null);
  const [hasBootstrappedWidth, setHasBootstrappedWidth] = useState(false);

  const captureLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));

    setObservedWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth
    );
  }, []);

  useEffect(() => {
    if (!enabled || observedWidth === null) {
      return;
    }

    // snap the first width so mount does not animate from zero
    if (!hasBootstrappedWidth) {
      widthValue.value = observedWidth;
      setHasBootstrappedWidth(true);
      return;
    }

    widthValue.value = driveToWidth(observedWidth);
  }, [
    driveToWidth,
    enabled,
    hasBootstrappedWidth,
    observedWidth,
    widthValue,
  ]);

  const animatedWidthStyle = useAnimatedStyle(
    () =>
      enabled && hasBootstrappedWidth
        ? {
            width: widthValue.value,
          }
        : {},
    [enabled, hasBootstrappedWidth]
  );

  return {
    captureLayout,
    animatedWidthStyle,
  };
};
