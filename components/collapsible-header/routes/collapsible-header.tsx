import { View, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTargetMeasurement } from "@/hooks/use-target-measurment";

// adidas-home-header-marquee-animation 🔽

type MarqueeItemProps = {
  icon: React.ReactNode;
  text: string;
};

type TabItemProps = {
  label: string;
  isActive?: boolean;
};

const TabItem = ({ label, isActive }: TabItemProps) => {
  return (
    <Text className="text-sm font-light uppercase tracking-wide"  >
      {label}
    </Text>
  );
};

export default function CollapsibleHeader() {
  const insets = useSafeAreaInsets();

  const listRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffsetY = useScrollViewOffset(listRef);

  const { targetRef, onTargetLayout, measurement } = useTargetMeasurement();

  const rTargetContainerStyle = useAnimatedStyle(() => {
    if (measurement.value === null) return { transform: [{ translateY: 0 }] };

    const containerHeight = measurement.value.height;

    return {
      marginBottom: interpolate(
        scrollOffsetY.value,
        [0, containerHeight],
        [0, -containerHeight],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollOffsetY.value,
            [0, containerHeight],
            [0, -containerHeight],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white z-50">
        <Text className="text-lg font-semibold uppercase tracking-widest">Вибір Adidas</Text>
        <View className="flex-row items-center gap-5">
          
        </View>
      </View>
      <Animated.View style={rTargetContainerStyle}>
        <Animated.View
          ref={targetRef}
          className=" px-4 py-3 border-b border-neutral-200"
          onLayout={onTargetLayout}
        >
         
        </Animated.View>
        <View className="flex-row gap-10 px-4 py-4 border-b border-neutral-200">
          <TabItem label="Чоловіки" isActive />
          <TabItem label="Жінки" />
          <TabItem label="Діти" />
          <TabItem label="Новинки" />
          <TabItem label="Види спорту" />
        </View>
      </Animated.View>
      {/* List  */}
      <Animated.ScrollView ref={listRef} showsVerticalScrollIndicator={false}>
        <View className="h-[600px] bg-stone-100 justify-end px-6 pb-3">
          <View className="h-6 w-[100px] bg-white mb-1" />
          <View className="h-6 w-[130px] bg-white mb-4" />
          <View className="h-12 w-full bg-white" />
        </View>
        <View className="py-16 px-8">
          <View className="h-6 w-[110px] bg-stone-100 mb-1" />
          <View className="h-6 w-[140px] bg-stone-100 mb-4" />
          <View className="flex-row gap-2">
            <View className="h-[300px] w-[45%] bg-stone-100" />
            <View className="h-[300px] w-[45%] bg-stone-100" />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// adidas-home-header-marquee-animation 🔼
