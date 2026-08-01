import { useCallback, useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
};

const WIDTH_CACHE_LIMIT = 64;

// measure each content signature once and drive later changes through one width value
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

  // the first measurement establishes the shell without animating from zero
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

      // round up so fractional native measurements cannot clip the final glyph
      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));

      // delete before setting so a repeated key moves to the most recent position
      widthCacheRef.current.delete(measurementKey);

      if (widthCacheRef.current.size >= WIDTH_CACHE_LIMIT) {
        // map insertion order gives the lru entry at the front
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

  // a cached width can restore the shell before the hidden probe renders again
  useEffect(() => {
    if (enabled && cachedWidth !== undefined) {
      // promote cache hits so active states stay available longer
      widthCacheRef.current.delete(measurementKey);
      widthCacheRef.current.set(measurementKey, cachedWidth);
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
