import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import * as AC from "@bacons/apple-colors";

const SegmentedTabLayout = () => {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
    }}>
      <Stack.Screen
      name = "index"
      options={{
        title: "Segmented Tabs",
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

export default SegmentedTabLayout;
