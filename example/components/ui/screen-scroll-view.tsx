import React from "react";
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  useColorScheme,
  type ViewStyle,
} from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@/helpers/use-header-height";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type ScreenScrollViewProps = AnimatedProps<ScrollViewProps> & {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenScrollView({
  children,
  contentContainerStyle,
  style,
  ...props
}: React.PropsWithChildren<ScreenScrollViewProps>) {
  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const backgroundColor = useColorScheme() === "dark" ? "#111318" : "#F2F2F7";

  return (
    <AnimatedScrollView
      style={[{ flex: 1, backgroundColor }, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: 20,
          paddingTop: headerHeight,
          paddingBottom: bottom + 32,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
}
