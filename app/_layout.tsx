import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { TextInput, ScrollView, View, Text, Pressable } from "react-native";
import { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Searchbar } from "@/components/searchbar/search-bar";
import { AnimationProvider } from "@/components/searchbar/animation-provider";
import { Animations } from "@/components/drawer-content";
import "./global.css";
import "@/reanimatedConfg";
import { ActionTrayProvider } from "@/components/action-tray/context/action-tray-context";
import { StackedToastProvider } from "@/components/toast/provider/toast-provider";
import { ErrorBoundary } from "@/util/error-boundary";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { top } = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  return (
    <>
      <View style={{ paddingHorizontal: 12, marginTop: top + 16 }}>
        <AnimationProvider>
          <Searchbar query={query} setQuery={setQuery} />
        </AnimationProvider>
      </View>
      <ScrollView
        style={{ backgroundColor: "white" }}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        <Animations query={query} />
      </ScrollView>
    </>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <StackedToastProvider>
      <ActionTrayProvider>
        <BottomSheetModalProvider>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
              drawerStyle: {
                backgroundColor: "white",
              },
            }}
          />
        </BottomSheetModalProvider>
      </ActionTrayProvider>
      </StackedToastProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
