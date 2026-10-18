import React from "react";
import { View } from "react-native";
import type {
  LaminarAlign,
  LaminarAnimatedText,
  LaminarShadow,
  MotionRecipe,
} from "../types";
import { SlotsRun } from "./slots-run";
import { TickerRun } from "./ticker-run";

type NumericRunMode = "slots" | "ticker";

const switchStyle = {
  position: "relative",
  alignSelf: "flex-start",
} as const;

const hiddenLayerStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  opacity: 0,
} as const;

type NumericRunSwitchProps = {
  readonly mode: NumericRunMode;
  readonly value: string;
  readonly animatedText?: LaminarAnimatedText;
  readonly fromValue?: string;
  readonly preloadValue?: string;
  readonly slotsMotionRecipe: MotionRecipe;
  readonly tickerMotionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: React.ComponentProps<typeof SlotsRun>["textStyle"];
  readonly className?: string;
  readonly leading?: React.ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  readonly shadow?: LaminarShadow;
};

// select one numeric renderer so inactive layout cannot affect the handoff
export const NumericRunSwitch = React.memo(function NumericRunSwitch({
  mode,
  value,
  animatedText,
  fromValue,
  preloadValue,
  slotsMotionRecipe,
  tickerMotionRecipe,
  align,
  fontSize,
  textStyle,
  className,
  leading,
  leadingKey,
  leadingGap = 0,
  ready = true,
  shadow = false,
}: Readonly<NumericRunSwitchProps>) {
  return (
    <View style={switchStyle}>
      <View style={mode === "slots" ? undefined : hiddenLayerStyle}>
        <SlotsRun
          value={mode === "ticker" ? preloadValue ?? value : value}
          fromValue={mode === "slots" ? fromValue : undefined}
          motionRecipe={slotsMotionRecipe}
          align={align}
          fontSize={fontSize}
          textStyle={textStyle}
          className={className}
          leading={leading}
          leadingKey={leadingKey}
          leadingGap={leadingGap}
          ready={ready}
          shadow={shadow}
        />
      </View>
      {mode === "ticker" ? (
        <TickerRun
          value={value}
          animatedText={animatedText}
          motionRecipe={tickerMotionRecipe}
          align={align}
          fontSize={fontSize}
          textStyle={textStyle}
          className={className}
          leading={leading}
          leadingKey={leadingKey}
          leadingGap={leadingGap}
          ready={ready}
          shadow={shadow}
        />
      ) : null}
    </View>
  );
});

NumericRunSwitch.displayName = "NumericRunSwitch";
