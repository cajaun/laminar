import { useCallback, useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
};

const WIDTH_CACHE_LIMIT = 64;

export const useInlineAutoWidth = ({
  enabled,
  driveToWidth,
  measurementKey,
}: Params) => {
  const widthValue = useSharedValue(0);
  const measuredWidthRef = useRef<number | null>(null);
  const bootstrappedRef = useRef(false);
  const widthCacheRef = useRef(new Map<string, number>());
  const [hasBootstrappedWidth, setHasBootstrappedWidth] = useState(false);

  const applyWidth = useCallback(
    (nextWidth: number) => {
      if (measuredWidthRef.current === nextWidth) {
        return;
      }

      measuredWidthRef.current = nextWidth;

      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;
        widthValue.value = nextWidth;
        setHasBootstrappedWidth(true);
        return;
      }

      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, widthValue]
  );

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!enabled) {
        return;
      }

      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));

      if (
        !widthCacheRef.current.has(measurementKey) &&
        widthCacheRef.current.size >= WIDTH_CACHE_LIMIT
      ) {
        const oldestKey = widthCacheRef.current.keys().next().value;

        if (oldestKey !== undefined) {
          widthCacheRef.current.delete(oldestKey);
        }
      }

      widthCacheRef.current.set(measurementKey, nextWidth);
      applyWidth(nextWidth);
    },
    [applyWidth, enabled, measurementKey]
  );

  const cachedWidth = widthCacheRef.current.get(measurementKey);

  useEffect(() => {
    if (enabled && cachedWidth !== undefined) {
      applyWidth(cachedWidth);
    }
  }, [applyWidth, cachedWidth, enabled, measurementKey]);

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
    shouldMeasure: enabled && cachedWidth === undefined,
  };
};
