import { useCallback, useLayoutEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
};

const WIDTH_CACHE_LIMIT = 64;

// update shared width from content layout
export const useInlineAutoWidth = ({
  enabled,
  driveToWidth,
  measurementKey,
}: Params) => {
  const widthValue = useSharedValue(0);
  const hasBootstrappedWidth = useSharedValue(false);
  const measuredWidthRef = useRef<number | null>(null);
  const bootstrappedRef = useRef(false);
  const widthCacheRef = useRef(new Map<string, number>());
  const previousMeasurementKeyRef = useRef(measurementKey);
  const measurementGenerationRef = useRef(0);
  const enabledRef = useRef(enabled);

  if (previousMeasurementKeyRef.current !== measurementKey) {
    previousMeasurementKeyRef.current = measurementKey;
    measurementGenerationRef.current += 1;
  }

  enabledRef.current = enabled;
  const measurementGeneration = measurementGenerationRef.current;

  const applyWidth = useCallback(
    (nextWidth: number) => {
      if (measuredWidthRef.current === nextWidth) {
        return;
      }

      measuredWidthRef.current = nextWidth;

      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;
        widthValue.value = nextWidth;
        hasBootstrappedWidth.value = true;
        return;
      }

      // replace the animation from its current value
      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, hasBootstrappedWidth, widthValue]
  );

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // accept layout events from the current probe
      if (
        !enabledRef.current ||
        measurementGeneration !== measurementGenerationRef.current
      ) {
        return;
      }

      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));
      const cache = widthCacheRef.current;

      // replace repeated keys with the newest measurement
      cache.delete(measurementKey);
      if (cache.size >= WIDTH_CACHE_LIMIT) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(measurementKey, nextWidth);

      // drive the shell from the probe without another react render
      applyWidth(nextWidth);
    },
    [applyWidth, measurementGeneration, measurementKey]
  );

  const cachedWidth = widthCacheRef.current.get(measurementKey);

  useLayoutEffect(() => {
    if (!enabled || cachedWidth === undefined) {
      return;
    }

    const cache = widthCacheRef.current;
    cache.delete(measurementKey);
    cache.set(measurementKey, cachedWidth);
    applyWidth(cachedWidth);
  }, [applyWidth, cachedWidth, enabled, measurementKey]);

  const animatedWidthStyle = useAnimatedStyle(
    () =>
      enabled && hasBootstrappedWidth.value
        ? {
            width: widthValue.value,
          }
        : {},
    [enabled, hasBootstrappedWidth, widthValue]
  );

  return {
    captureLayout,
    animatedWidthStyle,
    // render content without a timer readiness gate
    isReady: true,
    shouldMeasure: enabled && cachedWidth === undefined,
  };
};
