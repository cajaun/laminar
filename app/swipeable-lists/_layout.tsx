import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import * as AC from "@bacons/apple-colors";

const SwipeableListsLayout = () => {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
    }}>
      <Stack.Screen
      name = "index"
      options={{
        title: "Swipeable Lists",
        headerTransparent: true,
        headerBlurEffect: "systemChromeMaterial",
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: true,
        headerStyle: {
          backgroundColor: "transparent",
        },
      }}
      />
         
    </Stack>
 
  );
};

export default SwipeableListsLayout;
