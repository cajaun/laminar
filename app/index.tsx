import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRouter } from "expo-router";
import { PressableScale } from "@/components/ui/utils/pressable-scale";
import { DrawerNavigationProp } from "@react-navigation/drawer";

export default function Index() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between pb-10  ">
      <View className="flex-1 justify-center items-center">
        <View className="h-40 w-40 rounded-3xl">
          <Image
          
            source={require("@/assets/images/app-icon.png")}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        <Text className="text-black text-5xl font-bold ">Laminar</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Built for motion, shaped by flow
        </Text>
      </View>

      <View className="items-center w-full">
        <Text className="text-gray-500 text-xs mb-4 text-center px-10">
          Laminar is a collection of fluid, reusable UI components and
          animations for React Native — designed to help you build smooth,
          modern interfaces with ease.
        </Text>
        <View className="w-full px-4">
          <PressableScale
            onPress={() => navigation.openDrawer()}
            className="bg-black h-[50px]  gap-[6px] justify-center items-center px-5 mx-auto w-full rounded-2xl"
          >
            <Text className="text-white text-lg font-bold">Explore</Text>
          </PressableScale>
        </View>
      </View>
    </SafeAreaView>
  );
}
