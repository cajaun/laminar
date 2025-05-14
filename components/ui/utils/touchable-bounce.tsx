"use client";

// @ts-expect-error: untyped helper
import RNTouchableBounce from "react-native/Libraries/Components/Touchable/TouchableBounce";

import {
  TouchableOpacityProps as RNTouchableOpacityProps,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import * as React from "react";

export type TouchableScaleProps = Omit<
  RNTouchableOpacityProps,
  "activeOpacity"
> & {
  /** Enables haptic feedback on press down. */
  sensory?:
    | boolean
    | "success"
    | "error"
    | "warning"
    | "light"
    | "medium"
    | "heavy";
};

/**
 * Touchable which scales the children down when pressed.
 */
const TouchableBounce = React.forwardRef<View, TouchableScaleProps>(
  ({ style, children, onPressIn, sensory, ...props }, ref) => {
    const onSensory = React.useCallback(() => {
      if (!sensory) return;
      if (sensory === true) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (sensory === "success") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (sensory === "error") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (sensory === "warning") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (sensory === "light") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (sensory === "medium") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (sensory === "heavy") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }, [sensory]);

    return (
      <RNTouchableBounce
        style={[style]}
        {...props}
        ref={ref}
        onPressIn={(ev: any) => {
          onSensory();
          onPressIn?.(ev);
        }}
      >
        {children ? children : <View />}
      </RNTouchableBounce>
    );
  }
);



export default TouchableBounce;
