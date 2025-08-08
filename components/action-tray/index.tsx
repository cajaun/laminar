import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  forwardRef,
} from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  SharedValue,
  SlideInDown,
  SlideOutDown,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Backdrop } from "./backdrop";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HORIZONTAL_MARGIN = 16;
const PADDING = 24;
const BORDER_RADIUS = 32;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_DURATION = 350;
const MIN_DURATION = 150;

type ActionTrayProps = {
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  contentMap: Record<number, React.ReactNode>;
  step: number;
};

export type ActionTrayRef = {
  open: () => void;
  isActive: () => boolean;
  close: () => void;

};

const ActionTray = forwardRef<ActionTrayRef, ActionTrayProps>(
  ({ style, onClose, contentMap, step }, ref) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contentHeight = useSharedValue(0);
    const prevHeight = useSharedValue(0);
    const active = useSharedValue(false);
    const context = useSharedValue({ y: 0 });
    const { bottom } = useSafeAreaInsets();
    const heightEasing = Easing.bezier(0.26, 1, 0.5, 1).factory();
    const contentEasing = Easing.bezier(0.26, 0.8, 0.25, 1).factory();
    const progress = useDerivedValue(() => {
      return 1 - translateY.value / SCREEN_HEIGHT;
    });
    const scrollTo = useCallback(
      (destination: number) => {
        "worklet";
        active.value = destination !== SCREEN_HEIGHT;
        translateY.value = withSpring(destination, {
          stiffness: 750, // lower for slower motion
          damping: 75, // higher for less bounce
          restSpeedThreshold: 0.01,
          restDisplacementThreshold: 0.01,
        });
      },
      [active, translateY]
    );

    const close = useCallback(() => {
      "worklet";
      scrollTo(SCREEN_HEIGHT);
    }, [scrollTo]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          "worklet";
          runOnJS(Haptics.selectionAsync)(); // Trigger haptic feedback
          scrollTo(0);
        },
        close,
        isActive: () => active.value,
      }),
      [close, scrollTo, active.value]
    );

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        if (event.translationY >= 0) {
          translateY.value = event.translationY + context.value.y;
        } else {
          translateY.value = context.value.y;
        }
      })
      .onEnd((event) => {
        const projectedEnd = translateY.value + event.velocityY / 60;
        const shouldClose =
          projectedEnd > contentHeight.value * 0.5 || event.velocityY > 1000;
        if (shouldClose) {
          if (onClose) runOnJS(onClose)();
          else close();
        } else {
          scrollTo(0);
        }
      });

    const rActionTrayStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const layoutAnimationConfig = useMemo(
      () => LinearTransition.duration(MAX_DURATION).easing(heightEasing),
      []
    );

    const opacityDuration = useDerivedValue(() => {
      const difference = Math.abs(contentHeight.value - prevHeight.value);
      prevHeight.value = contentHeight.value;
      return Math.min(
        Math.max((difference / 500) * 1000, MIN_DURATION),
        MAX_DURATION
      );
    });

    const handleLayout = (event: LayoutChangeEvent) => {
      contentHeight.value = event.nativeEvent.layout.height;
    };

    const content = useMemo(() => contentMap[step] || null, [step, contentMap]);
    const contentKey = useMemo(() => `step-${step}`, [step]);

    return (
      <>
        <Backdrop
          onTap={onClose ?? close}
          isActive={active}
          progress={progress}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.actionTrayContainer,
              { bottom: bottom },
              rActionTrayStyle,
              style,
            ]}
            layout={layoutAnimationConfig}
            onLayout={handleLayout}
          >
            <Animated.View style={styles.content}>
              <Animated.View
                key={contentKey}
                entering={FadeIn.duration(opacityDuration.value).easing(
                  contentEasing
                )}
                exiting={FadeOut.duration(opacityDuration.value).easing(
                  contentEasing
                )}
              >
                {content}
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);

const styles = StyleSheet.create({
  actionTrayContainer: {
    position: "absolute",
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    backgroundColor: "white",
    borderRadius: BORDER_RADIUS,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  content: {
    padding: PADDING,
  },
});

export { ActionTray };
