import { Github } from "@/assets/icons/github";
import { App } from "@/types/screens";
import { screens } from "@/util/screens-list";

import { usePathname, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { FC } from "react";
import {
  ListRenderItemInfo,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppSection = {
  title: string;
  data: App["animations"];
};

type Props = {
  query: string;
};

export const Animations: FC<Props> = ({ query }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const allAnimations = screens.flatMap((app) =>
    app.animations.filter((animation) =>
      animation.name.toLowerCase().includes(query.toLowerCase())
    )
  );

  const grouped: Record<string, App["animations"]> = {};

  allAnimations.forEach((animation) => {
    const firstLetter = animation.name[0].toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(animation);
  });

  const sections: AppSection[] = Object.keys(grouped)
    .sort()
    .map((letter) => ({
      title: letter,
      data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
    }));

  const _renderItem = ({
    item,
  }: ListRenderItemInfo<App["animations"][number]>) => (
    <Pressable onPress={() => router.push(item.href)} className="px-3 mb-1">
      <View
        className={`rounded-xl p-4 ${
          pathname === item.href ? "bg-[#F6F6F6] " : " "
        }`}
      >
        <Text className="text-black font-medium">{item.name}</Text>
      </View>
    </Pressable>
  );

  const _renderListHeaderComponent = () => {
    return (
      <View className=" px-3 gap-y-2 py-4">
        <Pressable onPress={() => router.push("/")} className="">
          <View
            className={`flex-row gap-x-2 items-center rounded-xl p-2 ${
              pathname === "/" ? "bg-[#F6F6F6]" : ""
            }`}
          >
            <SymbolView name="questionmark.circle" tintColor={"black"} />
            <Text className="text-black font-medium">About</Text>
          </View>
        </Pressable>

        <Pressable>
          <View className={`flex-row gap-x-2 items-center rounded-xl p-2  `}>
            <Github color="black" width={20} height={20} className = "px-2" />

            <Text className="text-black font-medium">GitHub</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const _renderSectionHeader = ({ section }: { section: AppSection }) => (
    <View className="">
      <View className="flex-row items-center gap-2 px-6 py-4">
        <Text className="text-[#78716c] text-base font-bold">
          {section.title}
        </Text>
      </View>
    </View>
  );

  const _renderEmptyListComponent = () => (
    <View className="flex-1 items-center justify-center">
      <Text className="text-stone-400 text-base">No animations found</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <SectionList
        sections={sections}
        keyExtractor={(item: App["animations"][number], index: number) =>
          `${item.name}-${index}`
        }
        renderSectionHeader={_renderSectionHeader}
        renderItem={_renderItem}
        ListHeaderComponent={_renderListHeaderComponent}
        ListEmptyComponent={_renderEmptyListComponent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};
