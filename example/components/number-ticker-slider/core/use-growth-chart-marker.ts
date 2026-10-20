import { Gesture } from "react-native-gesture-handler";
import {
  clamp,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function useGrowthChartMarker(width: number, height: number) {
  const markerProgress = useSharedValue(0.88);
  const gestureStartProgress = useSharedValue(0.88);
  const markerScale = useSharedValue(0.8);
  const markerPoint = useDerivedValue(() => {
    const t = markerProgress.get();
    const inverseT = 1 - t;

    return {
      x:
        3 * inverseT * inverseT * t * (width * 0.3) +
        3 * inverseT * t * t * (width * 0.7) +
        t * t * t * width,
      y:
        inverseT * inverseT * inverseT * (height * 0.77) +
        3 * inverseT * inverseT * t * (height * 0.69) +
        3 * inverseT * t * t * (height * 0.55),
    };
  });
  const upperStemStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 6,
    height: markerPoint.get().y,
  }));
  const lowerStemStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 5,
    top: markerPoint.get().y,
    height: height - markerPoint.get().y,
  }));
  const markerStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 24,
    top: markerPoint.get().y - 24,
    transform: [{ scale: markerScale.get() }],
  }));
  const chartGesture = Gesture.Pan()
    .hitSlop(16)
    .onBegin(() => {
      gestureStartProgress.set(markerProgress.get());
      markerScale.set(withSpring(1));
    })
    .onUpdate((event) => {
      const horizontalDelta = event.translationX / width;
      const verticalDelta = -event.translationY / height;
      const delta =
        Math.abs(verticalDelta) > Math.abs(horizontalDelta)
          ? verticalDelta
          : horizontalDelta;

      markerProgress.set(clamp(gestureStartProgress.get() + delta, 0.04, 0.96));
    })
    .onFinalize(() => {
      markerScale.set(withSpring(0.8));
    });

  return {
    chartGesture,
    lowerStemStyle,
    markerStyle,
    upperStemStyle,
  };
}
