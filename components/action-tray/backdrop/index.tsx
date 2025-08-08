import React from "react";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

type BackdropProps = {
  onTap: () => void;
  isActive: SharedValue<boolean>;
  progress: SharedValue<number>;
};

const Backdrop: React.FC<BackdropProps> = React.memo(({ isActive, onTap, progress }) => {
  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  }, [progress]);

  const rBackdropProps = useAnimatedProps(() => {
    return {
      pointerEvents: progress.value > 0 ? "auto" : "none",
    } as any;
  }, []);

  return (
    <Animated.View
      onTouchStart={onTap}
      animatedProps={rBackdropProps}
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.2)",
        },
        rBackdropStyle,
      ]}
    />
  );
});

export { Backdrop };
