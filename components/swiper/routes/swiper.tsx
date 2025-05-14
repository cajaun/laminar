import { ScrollView, View, Text, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Carousel,
  CarouselContent,
  CarouselImage,
  CarouselPagination,
} from "@/components/swiper";
import { Image } from "expo-image";
import { Heart } from "@/assets/icons/heart";
import { Comment } from "@/assets/icons/comment";
import { Share } from "@/assets/icons/share";
import { Bookmark } from "@/assets/icons/book-mark";
import { ThreeDots } from "@/assets/icons/three-dots";
import { PressableScale } from "@/components/ui/utils/pressable-scale";

type Post = {
  images: CarouselImage[];
};

const images = [
  require("@/assets/images/swiper/1.jpg"),
  require("@/assets/images/swiper/2.jpg"),
  require("@/assets/images/swiper/3.jpg"),
  require("@/assets/images/swiper/4.jpg"),
  require("@/assets/images/swiper/5.jpg"),
  require("@/assets/images/swiper/6.jpg"),
  require("@/assets/images/swiper/7.jpg"),
  require("@/assets/images/swiper/8.jpg"),
];

const posts: Post[] = [
  { images: images.slice(0, 8) },
  // { images: images.slice(0, 4).concat(images.slice(0, 7)) },
  // { images: images.slice(4, 8) },
];

export default function Swiper() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="py-2 px-3  flex-row justify-between items-center">
        <View className="flex-row gap-x-1.5 items-center">
          <Image
            source={{ uri: "https://picsum.photos/seed/696/3000/2000" }}
            style={{
              height: 35,
              width: 35,
              borderRadius: 17.5,
            }}
            contentFit="cover"
          />

          <View className="">
            <Text className="font-extrabold text-sm">cajaun</Text>

            <Text className="text-xs font-medium">Suggested for you</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-x-2 h-full">
          <PressableScale className="bg-[#EFEFEF] h-9 justify-center items-center w-fit px-5 mx-auto  rounded-lg">
            <Text className="text-black font-extrabold text-sm">Follow</Text>
          </PressableScale>

          <ThreeDots width={25} height={25} color="black" />
        </View>
      </View>
      {posts.map((post, index) => (
        <Carousel key={index} images={post.images}>
          <CarouselContent
            width={width}
            renderItem={({ item }) => (
              <View
                className=" items-center justify-center"
                style={{ width, aspectRatio: 3 / 4 }}
              >
                <Image
                  source={item}
                  style={{ width, aspectRatio: 3 / 4 }}
                  contentFit="cover"
                />
              </View>
            )}
          />
          <View className="p-3 gap-y-2">
            <View className="items-center justify-center">
              <CarouselPagination />
            </View>

            <View className="flex-row justify-between ">
              <View className="flex-row items-center gap-x-4">
                <View className="flex-row items-center gap-x-2 ">
                  <Heart width={25} height={25} color="black" />
                  <Text className="font-extrabold text-sm">15.1k</Text>
                </View>

                <View className="flex-row items-center gap-x-2 ">
                  <Comment width={25} height={25} color="black" />
                  <Text className="font-extrabold text-sm">133</Text>
                </View>

                <View className="flex-row items-center gap-x-2 ">
                  <Share width={25} height={25} color="black" />
                  <Text className="font-extrabold text-sm">69</Text>
                </View>
              </View>

              <View>
                <Bookmark width={25} height={25} color="black" />
              </View>
            </View>

            <View className="gap-y-1">
              <Text className="font-extrabold text-sm">cajaun</Text>
              <Text className="text-xs text-[#737373] font-medium">
                1 day ago
              </Text>
            </View>
          </View>
        </Carousel>
      ))}
    </ScrollView>
  );
}
