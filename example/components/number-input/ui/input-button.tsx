import React from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

type InputButtonProps = {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
};

export const InputButton = React.memo(function InputButton({
  children,
  style,
  onPress,
  onLongPress,
}: InputButtonProps) {
  return (
    <Pressable
      delayLongPress={450}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && { opacity: 0.72 }]}
    >
      {children}
    </Pressable>
  );
});
