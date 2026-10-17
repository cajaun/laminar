import React from "react";
import { Text, View } from "react-native";
import { Laminar } from "react-native-laminar";
import { MechanismFrame, teachingBlue } from "../shared";
import { useDemoTheme } from "../../demo-theme";

function readUnits(value: string) {
  const prefix = value.match(/^\D*/)?.[0] ?? "";

  return {
    prefix,
    units: value.slice(prefix.length).split(""),
  };
}

function isDigit(unit: string) {
  return unit >= "0" && unit <= "9";
}

const laneWidth = 25;
const laneHeight = 44;
const laneTextHeight = 30;
const digitContainerStyle = {
  width: laneWidth,
  height: laneTextHeight,
  alignSelf: "center" as const,
};

const DashedSeparator = React.memo(function DashedSeparator({
  color,
}: {
  readonly color: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 1,
        justifyContent: "space-between",
      }}
    >
      {[0, 1, 2, 3, 4].map((segment) => (
        <View
          key={`dash:${segment}`}
          style={{ width: 1, height: 5, backgroundColor: color }}
        />
      ))}
    </View>
  );
});

const SlotPrefixLane = React.memo(function SlotPrefixLane({
  value,
  color,
}: {
  readonly value: string;
  readonly color: string;
}) {
  return (
    <View
      style={{
        width: laneWidth,
        height: laneHeight,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color,
          fontFamily: "Sf-semibold",
          fontSize: 25,
          lineHeight: laneTextHeight,
          fontVariant: ["tabular-nums"],
          textAlign: "center",
          width: laneWidth,
        }}
      >
        {value}
      </Text>
    </View>
  );
});

const SlotDigitLane = React.memo(function SlotDigitLane({
  unit,
  color,
  separatorColor,
}: {
  readonly unit: string;
  readonly color: string;
  readonly separatorColor: string;
}) {
  const textStyle = React.useMemo(
    () => ({
      color,
      fontFamily: "Sf-semibold" as const,
      fontSize: 25,
      lineHeight: laneTextHeight,
      fontVariant: ["tabular-nums"] as ["tabular-nums"],
      textAlign: "center" as const,
      width: laneWidth,
    }),
    [color],
  );

  return (
    <View
      style={{
        width: laneWidth,
        height: laneHeight,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DashedSeparator color={separatorColor} />
      {isDigit(unit) ? (
        <Laminar
          text={unit}
          variant="slots"
          shadow
          autoSize={false}
          align="center"
          clipToBounds
          fontSize={25}
          containerStyle={digitContainerStyle}
          style={textStyle}
        />
      ) : (
        <Text style={textStyle}>{unit}</Text>
      )}
    </View>
  );
});

type SlotMechanismProps = {
  readonly current: string;
};

export function SlotMechanism({ current }: SlotMechanismProps) {
  const theme = useDemoTheme();
  const { prefix, units } = readUnits(current);

  return (
    <MechanismFrame>
      <View style={{ alignItems: "center" }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 8,
              color: theme.secondary,
              fontFamily: "Sf-semibold",
              fontSize: 12,
              letterSpacing: 0.5,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            whole value
          </Text>
          <View
            style={{
              width: 120,
              height: 58,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.border,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: theme.secondary,
                fontFamily: "Sf-semibold",
                fontSize: 25,
                fontVariant: ["tabular-nums"],
                textAlign: "center",
              }}
            >
              {current}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 18, alignItems: "center" }}>
          <Text
            style={{
              marginBottom: 8,
              color: theme.accent,
              fontFamily: "Sf-semibold",
              fontSize: 12,
              letterSpacing: 0.5,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            digit lanes
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: teachingBlue,
              borderRadius: 14,
              paddingHorizontal: 8,
              paddingVertical: 6,
              backgroundColor: theme.teachingSurface,
            }}
          >
            <SlotPrefixLane value={prefix} color={theme.primary} />
            {units.map((unit, index) => (
              <SlotDigitLane
                key={`lane:${index}`}
                unit={unit}
                color={theme.primary}
                separatorColor={theme.border}
              />
            ))}
          </View>
        </View>
      </View>
    </MechanismFrame>
  );
}
