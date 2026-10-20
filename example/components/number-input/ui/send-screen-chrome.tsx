import React from "react";
import { Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";

export const SendHeader = React.memo(function SendHeader({
  onClose,
}: {
  readonly onClose: () => void;
}) {
  const theme = useDemoTheme();

  return (
    <View
      style={{

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text
      className="text-4xl"
        style={{
          color: theme.primary,
          fontFamily: "Sf-bold",
        }}
      >
        Send
      </Text>
      <PressableScale
        onPress={onClose}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name="xmark"
          tintColor={theme.primary}
          weight="medium"
          size={20}
        />
      </PressableScale>
    </View>
  );
});

export const RecipientField = React.memo(function RecipientField() {
  const theme = useDemoTheme();

  return (
    <View
      style={{
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: theme.isDark ? "#141414" : "#F5F5F5",
      }}
    >
      <Text
      className="text-2xl"
        style={{
          color: theme.isDark ? "#727272" : theme.secondary,
          fontFamily: "Sf-semibold",
        }}
      >
        To
      </Text>
      <Text
        className="text-2xl"
        style={{
          flex: 1,
          color: theme.isDark ? "#2C2C2C" : "#D3D3D3",
          fontFamily: "Sf-semibold",
        }}
      >
        ENS or Address
      </Text>
    </View>
  );
});

export const ContinueButton = React.memo(function ContinueButton() {
  const theme = useDemoTheme();

  return (
    <PressableScale
      style={{
        width: "100%",
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 28,
        backgroundColor: theme.actionSurface,
      }}
    >
      <Text
      className ="text-3xl"
        style={{
          color: theme.actionForeground,
          fontFamily: "Sf-bold",
        }}
      >
        Continue
      </Text>
    </PressableScale>
  );
});
