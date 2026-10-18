import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { enableFreeze } from "react-native-screens";
import { Platform, useColorScheme, View } from "react-native";
import "../global.css";

// Inactive native-stack screens should not reconcile while a new route is
// mounting. This keeps the catalog's demo tree out of the chart transition.
enableFreeze(true);

export default function RootLayout() {
  const isDark = useColorScheme() === "dark";
  const isLiquidGlass = isLiquidGlassAvailable();
  const [loaded] = useFonts({
    "Sf-black": require("../assets/fonts/SF-Pro-Rounded-Black.otf"),
    "Sf-bold": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "Sf-semibold": require("../assets/fonts/SF-Pro-Rounded-Semibold.otf"),
    "Sf-medium": require("../assets/fonts/SF-Pro-Rounded-Medium.otf"),
    "Sf-regular": require("../assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "Sf-light": require("../assets/fonts/SF-Pro-Rounded-Light.otf"),
    "Sf-thin": require("../assets/fonts/SF-Pro-Rounded-Thin.otf"),
  });

  if (!loaded) {
    return null;
  }

  const backgroundColor = isDark ? "#111318" : "#F2F2F7";
  const foregroundColor = isDark ? "#F5F5F5" : "#111318";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <View style={{ flex: 1, backgroundColor }}>
          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              headerTransparent: true,
              headerBlurEffect: isLiquidGlass
                ? undefined
                : isDark
                  ? "dark"
                  : "light",
              headerTintColor: foregroundColor,
              headerTitleStyle: { fontFamily: "Sf-semibold" },
              headerStyle: {
                backgroundColor: Platform.select({
                  ios: undefined,
                  android: backgroundColor,
                }),
              },
              headerBackButtonDisplayMode: "generic",
              gestureEnabled: true,
              gestureDirection: "horizontal",
              fullScreenGestureEnabled: isLiquidGlass ? false : true,
              freezeOnBlur: true,
              contentStyle: { backgroundColor },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="chart" />
            <Stack.Screen name="laminar" />
            <Stack.Screen name="laminar-demo/[demo]" />
          </Stack>
        </View>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
