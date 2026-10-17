import React from "react";
import { Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import { teachingBlue } from "../shared";
import { useDemoTheme } from "../../demo-theme";

export function AutoSizeComparison({ value }: { readonly value: string }) {
  const theme = useDemoTheme();
  const comparisonTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 18,
      textAlign: "center" as const,
    }),
    [theme.primary],
  );

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 6,
              color: theme.secondary,
              fontFamily: "Sf-semibold",
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            fixed
          </Text>
          <View
            style={{
              width: 132,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 7,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: theme.secondary,
                fontFamily: "Sf-semibold",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              {value}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 24,
            marginTop: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SymbolView name="arrow.right" size={20} tintColor={teachingBlue} />
        </View>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 6,
              color: theme.accent,
              fontFamily: "Sf-semibold",
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            measured
          </Text>
          <View
            style={{
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.accent,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 7,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.teachingSurface,
            }}
          >
            <Laminar
              text={value}
              autoSize
              clipToBounds={false}
              fontSize={18}
              style={comparisonTextStyle}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
