import { useCallback, useLayoutEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
};

const WIDTH_CACHE_LIMIT = 64;

// Measure each content signature once. Layout events update the shared width
// directly so measurement never needs a timer or a React readiness render.
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

      // Assigning a new animation naturally interrupts and continues from the
      // current value; no explicit cancellation is required.
      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, hasBootstrappedWidth, widthValue]
  );

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // Native layout events can arrive after the probe that produced them has
      // been replaced. Only the current generation may update the width.
      if (
        !enabledRef.current ||
        measurementGeneration !== measurementGenerationRef.current
      ) {
        return;
      }

      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));
      const cache = widthCacheRef.current;

      // Delete before setting so a repeated key becomes the newest entry.
      cache.delete(measurementKey);
      if (cache.size >= WIDTH_CACHE_LIMIT) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(measurementKey, nextWidth);

      // The visible row is already rendered. Drive the shell from the probe
      // without scheduling a second React render.
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
    // Content is never held behind a timer-driven readiness gate.
    isReady: true,
    shouldMeasure: enabled && cachedWidth === undefined,
  };
};
