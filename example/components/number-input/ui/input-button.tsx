import React from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      delayLongPress={450}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(1.5);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={style}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
});
