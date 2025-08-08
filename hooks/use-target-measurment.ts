import { useEffect, useState } from "react";
import {
  measure,
  MeasuredDimensions,
  runOnUI,
  useAnimatedRef,
  useSharedValue,
} from "react-native-reanimated";

// Looks like there is a global issue with measure method
// https://github.com/software-mansion/react-native-reanimated/issues/7079

export const useTargetMeasurement = () => {
  const [isTargetMounted, setIsTargetMounted] = useState(false);
  const targetRef = useAnimatedRef();

  const measurement = useSharedValue<MeasuredDimensions | null>(null);

  const handleMeasurement = () => {
    runOnUI(() => {
      const result = measure(targetRef);
      if (result === null) {
        return;
      }
      measurement.value = result;
    })();
  };

  useEffect(() => {
    if (isTargetMounted) {
      setTimeout(() => {
        handleMeasurement();
      }, 500); // Wait for sure the target to be mounted
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTargetMounted]);

  const onTargetLayout = () => {
    if (isTargetMounted === false) {
      setIsTargetMounted(true);
    }
  };

  return { measurement, targetRef, onTargetLayout };
};
