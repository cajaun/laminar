import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
  trackMeasuredWidth?: boolean;
};

type MeasuredWidth = {
  key: string;
  width: number;
};

const WIDTH_CACHE_LIMIT = 64;

// update the shared width when content lays out
export const useInlineAutoWidth = ({
  enabled,
  driveToWidth,
  measurementKey,
  trackMeasuredWidth = false,
}: Params) => {
  const widthValue = useSharedValue(0);
  const hasBootstrappedWidth = useSharedValue(false);
  const measuredWidthRef = useRef<number | null>(null);
  const bootstrappedRef = useRef(false);
  const widthCacheRef = useRef(new Map<string, number>());
  const previousMeasurementKeyRef = useRef(measurementKey);
  const measurementGenerationRef = useRef(0);
  const enabledRef = useRef(enabled);
  const [latestMeasuredWidth, setLatestMeasuredWidth] =
    useState<MeasuredWidth | null>(null);

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

      if (trackMeasuredWidth) {
        widthValue.value = nextWidth;
        return;
      }

      // restart the animation from its current width
      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, hasBootstrappedWidth, trackMeasuredWidth, widthValue]
  );

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // accept measurements only from the active probe
      if (
        !enabledRef.current ||
        measurementGeneration !== measurementGenerationRef.current
      ) {
        return;
      }

      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));
      const cache = widthCacheRef.current;

      // keep the newest measurement for each key
      cache.delete(measurementKey);
      if (cache.size >= WIDTH_CACHE_LIMIT) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(measurementKey, nextWidth);
      if (trackMeasuredWidth) {
        setLatestMeasuredWidth((current) =>
          current?.key === measurementKey && current.width === nextWidth
            ? current
            : { key: measurementKey, width: nextWidth },
        );
      }

      // update the shell from the probe without another react render
      applyWidth(nextWidth);
    },
    [applyWidth, measurementGeneration, measurementKey, trackMeasuredWidth]
  );

  const cachedWidth = widthCacheRef.current.get(measurementKey);
  const hasCurrentMeasuredWidth =
    cachedWidth !== undefined || latestMeasuredWidth?.key === measurementKey;

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
    measuredWidth: trackMeasuredWidth
      ? cachedWidth ??
        (latestMeasuredWidth?.key === measurementKey
          ? latestMeasuredWidth.width
          : undefined)
      : undefined,
    // wait for a tracked width before releasing a reel step transition
    isReady: !enabled || !trackMeasuredWidth || hasCurrentMeasuredWidth,
    shouldMeasure: enabled && cachedWidth === undefined,
  };
};
