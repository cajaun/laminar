import { Stack } from "expo-router";
import { MorphDemoScreen } from "@/components/morph-demo";
import { NavigationHeaderAction } from "@/components/ui/navigation-header-action";

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Laminar demos",
          headerBackVisible: false,
          headerLeft: () => (
            <NavigationHeaderAction
              accessibilityLabel="Settings"
              icon="settings-outline"
              onPress={() => undefined}
            />
          ),
        }}
      />
      <MorphDemoScreen />
    </>
  );
}
