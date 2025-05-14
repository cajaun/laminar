import React, { FC, useState } from "react";
import { View, TextInput } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Search } from "lucide-react-native";

import {
  SEARCHBAR_HEIGHT,
  SEARCHBAR_INITIAL_WIDTH,
  SEARCHBAR_END_WIDTH,
  useHomeAnimation,
} from "./animation-provider";
import { CancelButton } from "./cancel-button";

type SearchbarProps = {
  query: string;
  setQuery: (value: string) => void;
};

export const Searchbar: FC<SearchbarProps> = ({ query, setQuery }) => {
  const { inputRef, searchbarWidth } = useHomeAnimation();
  const [isFocused, setIsFocused] = useState(false);

  const rContainerStyle = useAnimatedStyle(() => ({
    width: searchbarWidth.value,
  }));

  const rCancelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    pointerEvents: isFocused ? "auto" : "none",
  }));

  const handleFocus = () => {
    setIsFocused(true);
    searchbarWidth.value = withTiming(SEARCHBAR_END_WIDTH, { duration: 250 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    searchbarWidth.value = withTiming(SEARCHBAR_INITIAL_WIDTH, { duration: 250 });
  };

  return (
    <View className="flex-row items-center z-[999]">
      <Animated.View style={rContainerStyle} className="justify-center">
        <TextInput
          ref={inputRef}
          placeholder="Search"
          placeholderTextColor="#78716c"
          className="bg-[#E3E2EA] text-black/90 pl-10 pr-3 rounded-xl text-base leading-5"
          style={{height: SEARCHBAR_HEIGHT}}
          selectionColor="#000"
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={query}
          onChangeText={setQuery}
        />
        <View className="absolute left-3 justify-center items-center h-full">
          <Search size={16} color="#78716c" />
        </View>
      </Animated.View>

      <Animated.View style={rCancelStyle}>
        <CancelButton />
      </Animated.View>
    </View>
  );
};
