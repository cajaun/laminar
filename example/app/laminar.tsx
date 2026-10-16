import { Stack, useRouter } from "expo-router";
import { MorphDemoScreen } from "@/components/morph-demo";
import { NavigationHeaderAction } from "@/components/ui/navigation-header-action";

export default function LaminarRoute() {
  const router = useRouter();

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
          headerRight: () => (
            <NavigationHeaderAction
              accessibilityLabel="Open Ethereum chart"
              icon="analytics-outline"
              onPress={() => router.push("/chart")}
            />
          ),
        }}
      />
      <MorphDemoScreen />
    </>
  );
}
