import { View } from "react-native";

export const FeedPost = () => {
  return (
    <View className="w-full px-4 flex-row gap-4  ">
      <View className="w-[30px] h-[30px] rounded-full bg-[#D0D9DE]" />
      <View className="flex-1">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="flex-1 gap-2">
            <View className="w-40 h-3 rounded-md bg-[#D0D9DE]" />
            <View className="w-32 h-3 rounded-md bg-[#D0D9DE]" />
          </View>
        </View>
        <View className="gap-2 mb-4">
          <View className="w-full h-3 rounded-md bg-[#D0D9DE]" />
          <View className="w-5/6 h-3 rounded-md bg-[#D0D9DE]" />
        </View>
        <View className="w-full aspect-video rounded-xl bg-[#D0D9DE]" />
      </View>
    </View>
  );
};
