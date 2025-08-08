import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";

const HeaderLayout = () => {
  return (
    <Stack>
       <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerRight: () => (
            <View className="flex-row items-center gap-4">
       
             
            </View>
          ),
        }}
      />
    </Stack>
  );
};

export default HeaderLayout;
