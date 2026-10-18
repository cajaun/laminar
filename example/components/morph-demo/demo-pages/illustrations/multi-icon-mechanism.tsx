import React from "react";
import { Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import {
  MechanismFrame,
  teachingBlue,
} from "../shared";
import { useDemoTheme } from "../../demo-theme";
import { LoadingSpinner } from "./loading-spinner";

const iconReplacementContainerStyle = {
  alignSelf: "center" as const,
};

type MultiIconMechanismProps = {
  readonly current: string;
};

function StateContent({
  current,
  color,
  iconColor,
}: {
  readonly current: string;
  readonly color: string;
  readonly iconColor: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {current === "Running Simulation" ? (
        <LoadingSpinner color={iconColor} size={20} />
      ) : current === "Simulation Done!" ? (
        <SymbolView
          name="checkmark.circle.fill"
          size={20}
          tintColor={iconColor}
        />
      ) : null}
      <Text
        numberOfLines={1}
        style={{
          color,
          fontFamily: "Sf-semibold",
          fontSize: 20,
        }}
      >
        {current}
      </Text>
    </View>
  );
}

export function MultiIconMechanism({ current }: MultiIconMechanismProps) {
  const theme = useDemoTheme();
  const leading = React.useMemo(
    () => ({
      "Running Simulation": (
        <LoadingSpinner color={theme.primary} size={20} />
      ),
      "Simulation Done!": (
        <SymbolView
          name="checkmark.circle.fill"
          size={20}
          tintColor={theme.primary}
        />
      ),
    }),
    [theme.primary],
  );
  const iconReplacementTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 20,
    }),
    [theme.primary],
  );

  return (
    <MechanismFrame>
      <View style={{ alignItems: "center", gap: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 7,
              color: theme.secondary,
              fontFamily: "Sf-semibold",
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            plain replacement
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.border,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <StateContent
              current={current}
              color={theme.secondary}
              iconColor={theme.primary}
            />
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 7,
              color: teachingBlue,
              fontFamily: "Sf-semibold",
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            icon replacement
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: teachingBlue,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: theme.teachingSurface,
            }}
          >
            <Laminar
              text={current}
              leading={leading}
              leadingGap={6}
              autoSize
              clipToBounds={false}
              fontSize={20}
              containerStyle={iconReplacementContainerStyle}
              style={iconReplacementTextStyle}
            />
          </View>
        </View>
      </View>
    </MechanismFrame>
  );
}
