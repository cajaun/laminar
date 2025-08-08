import { useEffect, type PropsWithChildren, type ReactElement } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
} from "react-native-reanimated";
import { useColorScheme } from "react-native";
import MediaParallaxBlur from "./media-parallax";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import { useHeaderTitle } from "@/hooks/use-header-title";
import { useHeaderBackground } from "../header/use-header-background";
import { useHeaderHeight } from "@react-navigation/elements";
import { ProminentHeaderButton } from "../ui/utils/prominent-header-button";
import { Ionicons } from "@expo/vector-icons";
import * as AC from "@bacons/apple-colors"
const HEADER_HEIGHT = 535;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  // headerForeground: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

const ParallaxScrollView = ({
  children,
  headerImage,
  // headerForeground,
  headerBackgroundColor,
}: Props) => {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const { bottom } = useSafeAreaInsets();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
      opacity: interpolate(scrollOffset.value, [400, 520], [1, 0]),
    };
  });

  const scrollOffsetY = useScrollViewOffset(scrollRef);

  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { y } }) => {
      offsetY.value = y;
    },
  });

  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,

      headerTransparent: true,
      title: "",
      headerLeft: () => (
        <ProminentHeaderButton>
          <Ionicons name="chevron-back" size={24} color={AC.label} />
        </ProminentHeaderButton>
      ),

      headerRight: () => (
        <View className="flex-row gap-4 mr-4">
          <TouchableOpacity className="w-9 h-9 bg-[#0000002d] rounded-full items-center justify-center">
            <Ionicons name="add" size={24} color={"white"} />
          </TouchableOpacity>
        </View>
      ),
  
    });
  }, [navigation]);

  const { triggerRef, onLayout } = useHeaderTitle({
    offsetY: scrollOffsetY,
    title: "vvv-sss",
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
        onScroll={scrollHandler}
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>

        <MediaParallaxBlur
          ref={triggerRef as React.LegacyRef<Animated.View>}
          onLayout={onLayout}
        />

        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
};

export default ParallaxScrollView;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  content: {
    flex: 1,

    gap: 16,
    overflow: "hidden",
  },
});
