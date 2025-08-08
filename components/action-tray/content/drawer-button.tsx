import { PressableScale } from "@/components/ui/utils/pressable-scale";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptic from "expo-haptics"

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DrawerButton({
  onPress,
  backgroundColor,
  icon,
  label,
  textColor = "#000",
  customStyles,
}: {
  onPress: () => void;
  backgroundColor: string;
  icon?: React.ReactNode;
  label: string;
  textColor?: string;
  customStyles?: object; 
}) {
  const isButtonActive = useSharedValue(false);

  const handlePress = () => {
    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
    onPress();
  };


  const rButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isButtonActive.value ? 0.96 : 1 }],
  }));

  return (
    <PressableScale
    style={
      customStyles ?? [ { backgroundColor }, styles.buttonContainer, rButtonStyle ]
    }
      onPress={handlePress}
    >
      {icon}
      <Text
        style={{ fontSize: 18, color: textColor, fontFamily: "OpenRunde-Semibold",   fontWeight: "medium", }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
  },
});

