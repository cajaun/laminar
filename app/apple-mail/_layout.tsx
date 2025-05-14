
import React from "react";
import { Stack } from "expo-router";

const AppleMailLayout = () => {

  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
    }}>
      <Stack.Screen
      name = "index"
      options={{
        headerShadowVisible: false,
        title: "All Inboxes",
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: "systemChromeMaterial",
        headerLargeTitleShadowVisible: false,

        headerLargeStyle: {
          backgroundColor: "transparent",
        },
        headerSearchBarOptions: {
          placeholder: "Search",
        },
      }}
      />
         
    </Stack>
 
  );
};

export default AppleMailLayout;
