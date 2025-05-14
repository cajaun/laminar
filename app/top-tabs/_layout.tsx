import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import * as AC from "@bacons/apple-colors";

const TopTabsLayout = () => {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
    }}>
      <Stack.Screen
      name = "index"
      options={{
        headerShown: false
      }}
      />
         
    </Stack>
 
  );
};

export default TopTabsLayout;
