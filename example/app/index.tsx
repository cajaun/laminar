import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="font-sf-bold text-[38px] leading-[42px] text-[#111318]">
            Laminar
          </Text>
          <Text className="mt-3 font-sf-medium text-[20px] leading-7 text-[#8E8E93]">
            Choose a demo to explore.
          </Text>
        </View>

        <View className="gap-4">
          <Link href="/chart" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Ethereum chart"
              className="rounded-[28px] bg-[#111318] px-6 py-5"
              style={({ pressed }) => (pressed ? { opacity: 0.78 } : undefined)}
            >
              <Text className="font-sf-bold text-[24px] text-white">
                Ethereum Chart
              </Text>
              <Text className="mt-1 font-sf-medium text-[17px] text-[#BFC2C7]">
                Explore the interactive Flux chart
              </Text>
            </Pressable>
          </Link>

          <Link href="/laminar" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Laminar demos"
              className="rounded-[28px] bg-[#F3F4F6] px-6 py-5"
              style={({ pressed }) => (pressed ? { opacity: 0.78 } : undefined)}
            >
              <Text className="font-sf-bold text-[24px] text-[#111318]">
                Laminar Demos
              </Text>
              <Text className="mt-1 font-sf-medium text-[17px] text-[#8E8E93]">
                See the text and number animations
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
