import React from "react";
import {
  StyleSheet,
  TouchableHighlight,
  View,
  type GestureResponderEvent,
} from "react-native";
import type { Href } from "expo-router";
import { Link as RouterLink } from "expo-router";
import type { ViewProps, ViewStyle, StyleProp } from "react-native";
import { formColors } from "./colors";
import { SectionStyleContext } from "./contexts";
import { HStack } from "./layout";
import { getFlatChildren } from "./utils";

export type FormItemProps = Pick<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly href?: Href;
  readonly onPress?: (event: GestureResponderEvent | unknown) => void;
  readonly onLongPress?: (event: GestureResponderEvent) => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly ref?: React.Ref<View>;
};

export function FormItem({
  children,
  href,
  onPress,
  onLongPress,
  disabled,
  style,
  ref,
}: FormItemProps) {
  const { itemPadding, minRowHeight } = React.useContext(SectionStyleContext);
  const rowStyle = [itemPadding, style];
  const contentStyle = [styles.minHeight, { minHeight: minRowHeight }];

  if (href == null) {
    if (onPress == null && onLongPress == null) {
      const childrenCount = getFlatChildren(children).length;

      if (childrenCount === 1) {
        return (
          <View style={rowStyle}>
            <View style={contentStyle}>{children}</View>
          </View>
        );
      }

      return (
        <View style={rowStyle}>
          <HStack style={contentStyle}>{children}</HStack>
        </View>
      );
    }

    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={formColors.pressed}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        style={disabled ? styles.disabled : undefined}
      >
        <View style={rowStyle}>
          <HStack style={contentStyle}>{children}</HStack>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <RouterLink asChild href={href} onPress={onPress as never}>
      <TouchableHighlight
        ref={ref}
        underlayColor={formColors.pressed}
        disabled={disabled}
        style={disabled ? styles.disabled : undefined}
        onLongPress={onLongPress}
      >
        <View style={rowStyle}>
          <HStack style={contentStyle}>{children}</HStack>
        </View>
      </TouchableHighlight>
    </RouterLink>
  );
}

if (__DEV__) FormItem.displayName = "FormItem";

const styles = StyleSheet.create({
  minHeight: {
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
