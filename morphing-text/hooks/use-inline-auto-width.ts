import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
};

export const useInlineAutoWidth = ({ enabled, driveToWidth }: Params) => {
  const widthValue = useSharedValue(0);
  const measuredWidthRef = useRef<number | null>(null);
  const bootstrappedRef = useRef(false);
  const [hasBootstrappedWidth, setHasBootstrappedWidth] = useState(false);

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!enabled) {
        return;
      }

      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));

      if (measuredWidthRef.current === nextWidth) {
        return;
      }

      measuredWidthRef.current = nextWidth;

      // snap the first width so mount does not animate from zero
      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;
        widthValue.value = nextWidth;
        setHasBootstrappedWidth(true);
        return;
      }

      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, enabled, widthValue]
  );

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
