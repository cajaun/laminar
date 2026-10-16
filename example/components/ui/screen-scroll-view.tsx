import React from "react";
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
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

  return (
    <AnimatedScrollView
      {...props}
      style={[{ flex: 1, backgroundColor: "#F5F5F5" }, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: 20,
          paddingTop: headerHeight,
          paddingBottom: bottom + 32,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </AnimatedScrollView>
  );
}
