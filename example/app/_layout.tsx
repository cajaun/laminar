import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform, View } from "react-native";
import "../global.css";


export default function RootLayout() {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              headerTransparent: true,
              headerBlurEffect: "light",
              headerTintColor: "#111318",
              headerTitleStyle: { fontFamily: "Sf-semibold" },
              headerStyle: {
                backgroundColor: Platform.select({
                  ios: undefined,
                  android: "#F5F5F5",
                }),
              },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: "generic",
              gestureEnabled: true,
              gestureDirection: "horizontal",
              fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
              contentStyle: { backgroundColor: "#F5F5F5" },
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
