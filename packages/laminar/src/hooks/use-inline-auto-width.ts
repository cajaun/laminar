import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { LayoutChangeEvent } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

type Params = {
  enabled: boolean;
  driveToWidth: (toValue: number) => number;
  measurementKey: string;
};

type PendingProbe = {
  key: string;
  width: number;
};

const WIDTH_CACHE_LIMIT = 64;

// measure each content signature once and drive later changes through one width value
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
  const hasCapturedVisibleLayoutRef = useRef(false);
  const initialMeasurementKeyRef = useRef<string | null>(null);
  const firstProbeRef = useRef<PendingProbe | null>(null);
  const latestProbeRef = useRef<PendingProbe | null>(null);
  const bootstrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [readyMeasurementKey, setReadyMeasurementKey] = useState<string | null>(
    null
  );

  const markMeasurementReady = useCallback((key: string) => {
    setReadyMeasurementKey((currentKey) =>
      currentKey === key ? currentKey : key
    );
  }, []);

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
        hasBootstrappedWidth.value = true;
        return;
      }

      widthValue.value = driveToWidth(nextWidth);
    },
    [driveToWidth, widthValue]
  );

  const bootstrapFromProbe = useCallback(() => {
    bootstrapTimerRef.current = null;

    if (hasCapturedVisibleLayoutRef.current) {
      return;
    }

    const firstProbe = firstProbeRef.current;
    if (!firstProbe) {
      return;
    }

    // The visible layout did not arrive in time, so use the first probe as a
    // safe fallback. A later probe can still animate from this baseline.
    hasCapturedVisibleLayoutRef.current = true;
    initialMeasurementKeyRef.current = firstProbe.key;
    applyWidth(firstProbe.width);

    const latestProbe = latestProbeRef.current;
    if (latestProbe && latestProbe.key !== firstProbe.key) {
      // The target width is already cached. Defer its animation until the
      // ready render so the shell and the new glyph row start together.
      markMeasurementReady(latestProbe.key);
    } else {
      markMeasurementReady(firstProbe.key);
    }
  }, [applyWidth, markMeasurementReady]);

  const captureVisibleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!enabled || hasCapturedVisibleLayoutRef.current) {
        return;
      }

      if (bootstrapTimerRef.current !== null) {
        clearTimeout(bootstrapTimerRef.current);
        bootstrapTimerRef.current = null;
      }

      hasCapturedVisibleLayoutRef.current = true;
      // bootstrap from the visible tree so the first explicit width matches
      // the geometry that was already painted to the user
      const nextWidth = Math.max(0, event.nativeEvent.layout.width);
      // retain the visible width for the initial key so a later cache hit does
      // not reintroduce the probe-to-visible mismatch
      widthCacheRef.current.delete(measurementKey);
      widthCacheRef.current.set(measurementKey, nextWidth);
      const firstProbe = firstProbeRef.current;
      if (firstProbe && firstProbe.key !== measurementKey) {
        initialMeasurementKeyRef.current = firstProbe.key;
        applyWidth(firstProbe.width);
        markMeasurementReady(measurementKey);
        return;
      }

      initialMeasurementKeyRef.current = measurementKey;
      applyWidth(nextWidth);
      markMeasurementReady(measurementKey);
    },
    [applyWidth, enabled, markMeasurementReady, measurementKey]
  );

  const captureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!enabled) {
        return;
      }

      // round up so fractional native measurements cannot clip the final glyph
      const nextWidth = Math.max(0, Math.ceil(event.nativeEvent.layout.width));

      const isInitialMeasurement =
        initialMeasurementKeyRef.current === measurementKey;

      if (!isInitialMeasurement) {
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
      }

      const probe = { key: measurementKey, width: nextWidth };
      if (!firstProbeRef.current) {
        firstProbeRef.current = probe;
      }
      latestProbeRef.current = probe;

      if (
        !hasCapturedVisibleLayoutRef.current &&
        bootstrapTimerRef.current === null
      ) {
        bootstrapTimerRef.current = setTimeout(bootstrapFromProbe, 0);
      }

      // Do not let the initial probe override the visible first frame.
      if (hasCapturedVisibleLayoutRef.current && !isInitialMeasurement) {
        // captureLayout only records the target. The cache effect applies the
        // animation during the render that releases the new glyph row.
        markMeasurementReady(measurementKey);
      }
    },
    [
      applyWidth,
      bootstrapFromProbe,
      enabled,
      markMeasurementReady,
      measurementKey,
    ]
  );

  const cachedWidth = widthCacheRef.current.get(measurementKey);

  // a cached width can restore the shell before the hidden probe renders again
  useLayoutEffect(() => {
    if (
      enabled &&
      cachedWidth !== undefined &&
      hasCapturedVisibleLayoutRef.current
    ) {
      // promote cache hits so active states stay available longer
      widthCacheRef.current.delete(measurementKey);
      widthCacheRef.current.set(measurementKey, cachedWidth);
      applyWidth(cachedWidth);
      markMeasurementReady(measurementKey);
    }
  }, [
    applyWidth,
    cachedWidth,
    enabled,
    markMeasurementReady,
    measurementKey,
  ]);

  useEffect(
    () => () => {
      if (bootstrapTimerRef.current !== null) {
        clearTimeout(bootstrapTimerRef.current);
      }
    },
    []
  );

  const animatedWidthStyle = useAnimatedStyle(
    () =>
      enabled && hasBootstrappedWidth.value
        ? {
            width: widthValue.value,
          }
        : {},
    [enabled]
  );

  return {
    captureLayout,
    captureVisibleLayout,
    animatedWidthStyle,
    isReady:
      !enabled ||
      cachedWidth !== undefined ||
      readyMeasurementKey === measurementKey,
    shouldMeasure: enabled && cachedWidth === undefined,
  };
};
