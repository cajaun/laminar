import { useEffect, type PropsWithChildren, type ReactElement } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import { LargeTitle } from "./large-title";
import { router, useNavigation } from "expo-router";
import { BlurView } from "expo-blur";
import { useHeaderTitle } from "@/hooks/use-header-title";
const HEADER_HEIGHT = 535;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  // headerForeground: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

const header = () => {
  return (
    <View className="flex-row justify-between">
      <View className="w-9 h-9 bg-[#0000002d] rounded-full items-center justify-center ml-4">
        <Ionicons name="chevron-back" size={24} color={"white"} />
      </View>

      <Text style={{ color: "white" }} className="text-xl font-bold">
        Snow white
      </Text>

      <View className="flex-row gap-4 mr-4">
        <View className="w-9 h-9 bg-[#0000002d] rounded-full items-center justify-center">
          <Ionicons name="add" size={24} color={"white"} />
        </View>
      </View>
    </View>
  );
};


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

  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { y } }) => {
      offsetY.value = y;
    },
  });

  const {top} = useSafeAreaInsets()
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerBlurEffect: "systemChromeMaterial",
      headerLargeTitleShadowVisible: false,
      headerShadowVisible: true,
      title: "",
      headerLeft: () => (
        <Pressable
  onPress={() => router.back()}
  className="w-9 h-9 rounded-full items-center justify-center ml-4 overflow-hidden  bg-transparent"
>
  <BlurView
intensity={20} tint="light"
    style={[StyleSheet.absoluteFill, { borderRadius: 36, backgroundColor: "#0000002d"  }]}
  />
  <Ionicons name="chevron-back" size={24} color="white" />
</Pressable>
      ),
      headerTitle: () => (
        <Text  className="text-xl font-bold text-white">
      Snow White
        </Text>
      ),
      headerRight: () => (
        <View className="flex-row gap-4 mr-4">
          <TouchableOpacity className="w-9 h-9 bg-[#0000002d] rounded-full items-center justify-center">
            <Ionicons name="add" size={24} color={"white"} />
          </TouchableOpacity>
       
        </View>
      ),
      // headerBackground: () => (
      //   <Animated.View className="absolute inset-0" />
      // ),
    });
  }, [navigation]);

  const scrollOffsetY = useScrollViewOffset(scrollRef);

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
       


        <MediaParallaxBlur ref={triggerRef} onLayout={onLayout} />

 


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
