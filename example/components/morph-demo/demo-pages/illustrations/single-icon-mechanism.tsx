import React from "react";
import { Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import {
  MechanismFrame,
  teachingBlue,
} from "../shared";
import { useDemoTheme } from "../../demo-theme";

const iconReplacementContainerStyle = {
  alignSelf: "center" as const,
};

type SingleIconMechanismProps = {
  readonly current: string;
};

function StateContent({
  current,
  color,
}: {
  readonly current: string;
  readonly color: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {current === "Confirm" ? (
        <SymbolView name="faceid" size={20} tintColor={color} />
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

export function SingleIconMechanism({ current }: SingleIconMechanismProps) {
  const theme = useDemoTheme();
  const leading = React.useMemo(
    () => ({
      Confirm: (
        <SymbolView name="faceid" size={20} tintColor={teachingBlue} />
      ),
    }),
    [],
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
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
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
              width: 132,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.border,
              borderRadius: 12,
            }}
          >
            <StateContent current={current} color={theme.secondary} />
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
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
              width: 132,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
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
