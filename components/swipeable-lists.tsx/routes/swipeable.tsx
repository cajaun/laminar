import React, { useCallback, useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  SlideOutLeft,
} from "react-native-reanimated";
import SlideToLeft from "@/components/swipeable-lists.tsx/SlideToLeft";
import { SETTING_DATA } from "@/components/swipeable-lists.tsx/test-data";
import {
  LIST_DATA,
  LIST_DATA_ITEM,
} from "@/components/swipeable-lists.tsx/types";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const SwipeableLists = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [listData, setListData] = useState<LIST_DATA>(SETTING_DATA);

  const deleteById = (id: string) => {
    setListData((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = (item: LIST_DATA_ITEM, index: number): JSX.Element => {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={SlideOutLeft}
        key={item.id}
        layout={LinearTransition}
      >
        {index !== 0 && <ItemSeparatorComponent />}
        <SlideToLeft onRightPress={() => deleteById(item.id)}>
          <View className="flex-row items-center bg-white">
            <View
              className="my-2 mx-3 rounded-full bg-gray-500 overflow-hidden"
              style={{
                width: 50,
                aspectRatio: 1,
              }}
            />
            <View className="flex-1 flex-row justify-between items-center mr-3">
              <Text style={{ fontSize: 18, color: "black" }}>{item.name}</Text>
            </View>
          </View>
        </SlideToLeft>
      </Animated.View>
    );
  };

  const ItemSeparatorComponent = () => {
    return (
      <View style={{ backgroundColor: theme.colors.card }}>
        <View
          style={{
            backgroundColor: "rgba(100,100,100,0.1)",
            height: 2,
            marginLeft: 74,
          }}
        />
      </View>
    );
  };
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Animated.View
        layout={LinearTransition}
        style={{
          backgroundColor: "rgba(100,100,100,0.1)",
          marginHorizontal: 20,
          borderRadius: 15,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        {listData.map(renderItem)}
      </Animated.View>

      {listData?.length === 0 && (
        <Animated.Text
          entering={FadeInDown}
          exiting={FadeOut}
          style={{
            marginTop: 20,
            fontSize: 18,
            color: "#666666",
            marginHorizontal: 30,
            textAlign: "center",
          }}
        >
          No items available. Click the '+' button to create a new one.
        </Animated.Text>
      )}
    </ScrollView>
  );
};

export default SwipeableLists;
