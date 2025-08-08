import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { AnimatedPressable } from "./drawer-button";
import { Text } from "react-native";

export default function ViewButton({
  onPress,
  icon,
  text,
  backgroundColor,
  textColor,
}: {
  onPress: () => void;
  icon?: React.ReactNode;
  text: string;
  backgroundColor: string;
  textColor?: string;
}) {
  const isButtonActive = useSharedValue(false);

  const handlePress = () => {
    onPress();
  };

  const onPressIn = () => {
    isButtonActive.value = true;
  };

  const onPressOut = () => {
    isButtonActive.value = false;
  };

  const rButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isButtonActive.value ? 0.96 : 1 }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        {
          flex: 1,
          flexDirection: "row",
          gap: 12,
          paddingVertical: 16,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: backgroundColor,
          borderRadius: 1000,
          borderCurve: "continuous",
        },
        rButtonStyle,
      ]}
    >
      {icon && icon}
      <Text
        style={{ fontSize: 18, color: textColor, fontFamily: "OpenRunde-Bold" }}
      >
        {text}
      </Text>
    </AnimatedPressable>
  );
}
